import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";
const eventId = __ENV.EVENT_ID;

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  if (!eventId) {
    console.error("Set EVENT_ID to a published event UUID");
    return;
  }
  const res = http.get(`${baseUrl}/api/events/${eventId}/leaderboard?scope=all&limit=25`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "has individuals array": (r) => {
      try {
        const j = r.json();
        return Array.isArray(j.individuals);
      } catch {
        return false;
      }
    },
  });
  sleep(1);
}
