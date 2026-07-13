import http from 'k6/http';
import { check, fail } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const EMAIL = __ENV.EMAIL || 'manager@branchbrew.dev';
const PASSWORD = __ENV.PASSWORD || 'password123';
const RATE = Number(__ENV.RATE || 5);
const DURATION = __ENV.DURATION || '60s';

const target = JSON.parse(open('./target.json'));

const checkoutDuration = new Trend('checkout_duration', true);
const stockErrors = new Counter('checkout_stock_errors');
const otherErrors = new Counter('checkout_other_errors');

export const options = {
  scenarios: {
    checkout: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: Math.max(10, RATE * 2),
      maxVUs: Math.max(50, RATE * 10),
    },
  },
  thresholds: {
    checkout_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (res.status !== 200) {
    fail(`login failed: ${res.status} ${res.body}`);
  }

  const cookie = res.cookies['erp_access_token'];
  if (!cookie || !cookie[0]) {
    fail('login succeeded but no erp_access_token cookie was returned');
  }

  return { token: cookie[0].value };
}

export default function (data) {
  const payload = JSON.stringify({
    branchId: target.branchId,
    items: [{ productId: target.productId, quantity: 1 }],
    paymentMethod: 'CASH',
  });

  const res = http.post(`${BASE_URL}/orders`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `erp_access_token=${data.token}`,
    },
    tags: { name: 'checkout' },
  });

  checkoutDuration.add(res.timings.duration);

  const ok = check(res, {
    'checkout accepted (201)': (r) => r.status === 201,
  });

  if (!ok) {
    if (res.status === 400 && String(res.body).includes('stock')) {
      stockErrors.add(1);
    } else {
      otherErrors.add(1);
    }
  }
}
