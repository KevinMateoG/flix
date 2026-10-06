import 'dotenv/config';

const BAKEND = process.env.BACKEND;

async function toggle() {
  const response = await fetch(`${BAKEND}/api/disklike/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
