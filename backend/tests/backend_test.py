"""
Backend API tests for Healthcare Marketplace.
Uses REACT_APP_BACKEND_URL from /app/frontend/.env (external preview URL).
"""
import os
import pytest
import requests
from pathlib import Path

# Read REACT_APP_BACKEND_URL from frontend .env
_env_path = Path('/app/frontend/.env')
BASE_URL = None
for line in _env_path.read_text().splitlines():
    if line.startswith('REACT_APP_BACKEND_URL='):
        BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
API = f"{BASE_URL}/api"

PASSWORD = 'Password123!'
USERS = {
    'alice':  'alice@hospital.com',   # hospital approver
    'bob':    'bob@hospital.com',     # hospital requestor
    'carol':  'carol@pharmacy.com',   # pharmacy approver
    'dan':    'dan@pharmacy.com',     # pharmacy requestor
    'eve':    'eve@vendor.com',       # vendor approver (seller)
    'frank':  'frank@distributor.com',# distributor approver (seller+buyer)
}


def _login(email):
    r = requests.post(f"{API}/auth/login", json={'email': email, 'password': PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login {email} -> {r.status_code} {r.text}"
    return r.json()


def _auth(token):
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture(scope='session')
def tokens():
    out = {}
    for k, email in USERS.items():
        data = _login(email)
        out[k] = {'token': data['token'], 'user': data['user']}
    return out


# ---------- Health ----------
def test_health():
    r = requests.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json().get('status') == 'ok'


# ---------- Auth ----------
def test_login_populates_organization(tokens):
    bob = tokens['bob']['user']
    assert bob['email'] == USERS['bob']
    # organization should be populated as object (not just id string)
    assert isinstance(bob.get('organization'), dict), f"org not populated: {bob.get('organization')}"
    assert bob['organization'].get('type') == 'hospital'
    assert bob['role'] == 'requestor'


def test_login_invalid_credentials():
    r = requests.post(f"{API}/auth/login", json={'email': USERS['bob'], 'password': 'wrong'})
    assert r.status_code == 401


def test_auth_me(tokens):
    t = tokens['alice']['token']
    r = requests.get(f"{API}/auth/me", headers=_auth(t))
    assert r.status_code == 200
    assert r.json()['user']['email'] == USERS['alice']


def test_register_new_org_approver():
    import uuid
    suffix = uuid.uuid4().hex[:8]
    payload = {
        'orgName': f'TEST_Org_{suffix}',
        'orgType': 'vendor',
        'name': 'TEST User',
        'email': f'test_{suffix}@example.com',
        'password': PASSWORD,
    }
    r = requests.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert 'token' in body
    assert body['user']['role'] == 'approver'
    assert body['user']['email'] == payload['email']


# ---------- Products ----------
def test_list_products(tokens):
    r = requests.get(f"{API}/products", headers=_auth(tokens['bob']['token']))
    assert r.status_code == 200
    prods = r.json()['products']
    assert len(prods) >= 6
    # populated sellerOrg
    assert isinstance(prods[0]['sellerOrg'], dict)
    assert 'name' in prods[0]['sellerOrg']


def test_list_products_filter_category(tokens):
    r = requests.get(f"{API}/products?category=medicines", headers=_auth(tokens['bob']['token']))
    assert r.status_code == 200
    prods = r.json()['products']
    assert all(p['category'] == 'medicines' for p in prods)
    assert len(prods) >= 1


def test_list_products_search(tokens):
    r = requests.get(f"{API}/products?search=Paracetamol", headers=_auth(tokens['bob']['token']))
    assert r.status_code == 200
    prods = r.json()['products']
    assert any('Paracetamol' in p['name'] for p in prods)


def test_list_products_isused_true(tokens):
    r = requests.get(f"{API}/products?isUsed=true", headers=_auth(tokens['bob']['token']))
    assert r.status_code == 200
    prods = r.json()['products']
    assert len(prods) >= 1
    assert all(p.get('isUsed') is True for p in prods)


def test_get_product_detail(tokens):
    lst = requests.get(f"{API}/products", headers=_auth(tokens['bob']['token'])).json()['products']
    pid = lst[0]['_id']
    r = requests.get(f"{API}/products/{pid}", headers=_auth(tokens['bob']['token']))
    assert r.status_code == 200
    p = r.json()['product']
    assert p['_id'] == pid
    assert isinstance(p['sellerOrg'], dict)
    assert 'name' in p['sellerOrg']


def test_create_product_as_seller(tokens):
    t = tokens['eve']['token']
    payload = {
        'name': 'TEST_New Sterile Mask',
        'description': 'test description',
        'category': 'consumables',
        'stock': 50,
        'unit': 'box',
        'tierPricing': [
            {'minQty': 1, 'unitPrice': 5.0},
            {'minQty': 100, 'unitPrice': 4.0},
        ],
        'qualityMetadata': {'material': 'Polyprop', 'certifications': ['CE']},
    }
    r = requests.post(f"{API}/products", json=payload, headers=_auth(t))
    assert r.status_code == 201, r.text
    p = r.json()['product']
    assert p['name'] == payload['name']
    assert len(p['tierPricing']) == 2
    # GET via mine
    mine = requests.get(f"{API}/products/mine", headers=_auth(t)).json()['products']
    assert any(x['_id'] == p['_id'] for x in mine)


def test_create_product_validation_400(tokens):
    t = tokens['eve']['token']
    # missing name + tierPricing
    r = requests.post(f"{API}/products", json={'category': 'consumables'}, headers=_auth(t))
    assert r.status_code == 400


def test_list_my_products(tokens):
    r = requests.get(f"{API}/products/mine", headers=_auth(tokens['eve']['token']))
    assert r.status_code == 200
    # All returned should have sellerOrg = eve's org
    eve_org = tokens['eve']['user']['organization']['_id']
    prods = r.json()['products']
    assert all(p['sellerOrg'] == eve_org for p in prods)


# ---------- Cart ----------
def _get_cart(token):
    r = requests.get(f"{API}/cart", headers=_auth(token))
    assert r.status_code == 200
    return r.json()['cart']


def _clear_cart(token):
    """Empty the requestor's draft cart by removing all items."""
    cart = _get_cart(token)
    for it in cart.get('items', []):
        requests.delete(f"{API}/cart/items/{it['_id']}", headers=_auth(token))


def test_cart_autocreates_for_requestor(tokens):
    t = tokens['bob']['token']
    _clear_cart(t)
    cart = _get_cart(t)
    assert cart['status'] == 'draft'
    assert cart['items'] == []


def _find_product(token, name_substr):
    prods = requests.get(f"{API}/products", headers=_auth(token)).json()['products']
    for p in prods:
        if name_substr.lower() in p['name'].lower():
            return p
    return None


def test_cart_add_item_tier_pricing(tokens):
    t = tokens['bob']['token']
    _clear_cart(t)
    # Paracetamol tiers: 1->4.5, 50->3.9, 200->3.2
    product = _find_product(t, 'Paracetamol')
    assert product, "Paracetamol not seeded"
    pid = product['_id']
    # Add 1 unit
    r = requests.post(f"{API}/cart/items", json={'productId': pid, 'quantity': 1}, headers=_auth(t))
    assert r.status_code == 200, r.text
    cart = r.json()['cart']
    assert len(cart['items']) == 1
    item = cart['items'][0]
    assert item['unitPrice'] == 4.5
    assert item['lineTotal'] == 4.5
    assert cart['total'] == 4.5
    # Update quantity to 60 to trigger tier 2
    item_id = item['_id']
    r = requests.patch(f"{API}/cart/items/{item_id}", json={'quantity': 60}, headers=_auth(t))
    assert r.status_code == 200
    cart = r.json()['cart']
    item = cart['items'][0]
    assert item['quantity'] == 60
    assert item['unitPrice'] == 3.9
    assert item['lineTotal'] == 3.9 * 60
    # Increase to 250 to trigger tier 3
    r = requests.patch(f"{API}/cart/items/{item_id}", json={'quantity': 250}, headers=_auth(t))
    assert r.status_code == 200
    item = r.json()['cart']['items'][0]
    assert item['unitPrice'] == 3.2


def test_cart_add_item_requires_requestor(tokens):
    """Approver must get 403 on POST /api/cart/items."""
    t = tokens['alice']['token']
    prods = requests.get(f"{API}/products", headers=_auth(t)).json()['products']
    # pick product not from hospital (hospital is buyer only anyway)
    pid = prods[0]['_id']
    r = requests.post(f"{API}/cart/items", json={'productId': pid, 'quantity': 1}, headers=_auth(t))
    assert r.status_code == 403


def test_cart_cannot_order_from_own_org(tokens):
    """Dan (pharmacy requestor) cannot buy from pharmacy-owned products."""
    t = tokens['dan']['token']
    _clear_cart(t)
    pharma_product = _find_product(t, 'Paracetamol')  # seeded sellerOrg=pharmacy
    assert pharma_product
    r = requests.post(f"{API}/cart/items",
                      json={'productId': pharma_product['_id'], 'quantity': 1},
                      headers=_auth(t))
    assert r.status_code == 400
    assert 'own' in r.json().get('error', '').lower()


def test_cart_remove_item(tokens):
    t = tokens['bob']['token']
    _clear_cart(t)
    product = _find_product(t, 'Gloves')
    assert product
    r = requests.post(f"{API}/cart/items",
                      json={'productId': product['_id'], 'quantity': 2},
                      headers=_auth(t))
    assert r.status_code == 200
    cart = r.json()['cart']
    item_id = cart['items'][0]['_id']
    r = requests.delete(f"{API}/cart/items/{item_id}", headers=_auth(t))
    assert r.status_code == 200
    cart_after = _get_cart(t)
    assert cart_after['items'] == []


# ---------- Full order lifecycle ----------
@pytest.fixture(scope='module')
def order_flow_ids(tokens):
    """Create a submitted order as Bob with a vendor-sold product (gloves)."""
    t = tokens['bob']['token']
    _clear_cart(t)
    gloves = _find_product(t, 'Gloves')  # vendor-sold
    assert gloves
    r = requests.post(f"{API}/cart/items",
                      json={'productId': gloves['_id'], 'quantity': 2},
                      headers=_auth(t))
    assert r.status_code == 200
    r = requests.post(f"{API}/cart/submit", headers=_auth(t))
    assert r.status_code == 200, r.text
    order = r.json()['order']
    assert order['status'] == 'pending_approval'
    return {'order_id': order['_id']}


def test_approve_order(tokens, order_flow_ids):
    t = tokens['alice']['token']  # hospital approver
    oid = order_flow_ids['order_id']
    r = requests.post(f"{API}/orders/{oid}/approve", headers=_auth(t))
    assert r.status_code == 200, r.text
    assert r.json()['order']['status'] == 'approved'


def test_pay_order(tokens, order_flow_ids):
    t = tokens['alice']['token']
    oid = order_flow_ids['order_id']
    r = requests.post(f"{API}/orders/{oid}/pay", headers=_auth(t))
    assert r.status_code == 200, r.text
    assert r.json()['order']['status'] == 'paid'


def test_deliver_by_non_seller_forbidden(tokens, order_flow_ids):
    # Frank is distributor, not the vendor seller for gloves -> 403
    t = tokens['frank']['token']
    oid = order_flow_ids['order_id']
    r = requests.post(f"{API}/orders/{oid}/deliver", headers=_auth(t))
    assert r.status_code == 403


def test_deliver_by_seller(tokens, order_flow_ids):
    t = tokens['eve']['token']  # vendor
    oid = order_flow_ids['order_id']
    r = requests.post(f"{API}/orders/{oid}/deliver", headers=_auth(t))
    assert r.status_code == 200, r.text
    assert r.json()['order']['status'] == 'delivered'


# ---------- Reject flow (separate order) ----------
def test_reject_order(tokens):
    t_bob = tokens['bob']['token']
    _clear_cart(t_bob)
    # add a vendor product
    gloves = _find_product(t_bob, 'Syringes')
    assert gloves
    requests.post(f"{API}/cart/items",
                  json={'productId': gloves['_id'], 'quantity': 1},
                  headers=_auth(t_bob))
    r = requests.post(f"{API}/cart/submit", headers=_auth(t_bob))
    oid = r.json()['order']['_id']
    t_alice = tokens['alice']['token']
    r = requests.post(f"{API}/orders/{oid}/reject",
                      json={'reason': 'Test rejection'},
                      headers=_auth(t_alice))
    assert r.status_code == 200, r.text
    assert r.json()['order']['status'] == 'rejected'


# ---------- Orders listing views ----------
def test_orders_buyer_view(tokens):
    t = tokens['alice']['token']  # hospital
    r = requests.get(f"{API}/orders?view=buyer", headers=_auth(t))
    assert r.status_code == 200
    orders = r.json()['orders']
    # All returned orders must be buyer=hospital org
    hospital_org_id = tokens['alice']['user']['organization']['_id']
    for o in orders:
        assert (o['buyerOrg']['_id'] if isinstance(o['buyerOrg'], dict) else o['buyerOrg']) == hospital_org_id


def test_orders_seller_view(tokens):
    t = tokens['eve']['token']
    r = requests.get(f"{API}/orders?view=seller", headers=_auth(t))
    assert r.status_code == 200
    orders = r.json()['orders']
    # None should be in draft
    assert all(o['status'] != 'draft' for o in orders)


# ---------- Org team mgmt ----------
def test_invite_user_as_approver(tokens):
    import uuid
    t = tokens['alice']['token']
    suffix = uuid.uuid4().hex[:6]
    payload = {
        'name': 'TEST Invitee',
        'email': f'test_invite_{suffix}@example.com',
        'password': PASSWORD,
        'role': 'requestor',
    }
    r = requests.post(f"{API}/orgs/me/users", json=payload, headers=_auth(t))
    # Should be 201 or 200
    assert r.status_code in (200, 201), r.text


def test_invite_user_as_requestor_forbidden(tokens):
    import uuid
    t = tokens['bob']['token']  # requestor
    suffix = uuid.uuid4().hex[:6]
    payload = {
        'name': 'TEST Forbidden',
        'email': f'test_forbid_{suffix}@example.com',
        'password': PASSWORD,
        'role': 'requestor',
    }
    r = requests.post(f"{API}/orgs/me/users", json=payload, headers=_auth(t))
    assert r.status_code == 403
