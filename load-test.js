import http from "k6/http";
import {check, sleep} from "k6";

export let options = {
  vus: 10000, // 10,000 concurrent users
  duration: "30s",
};

export default function () {
  let res = http.post(
    "http://localhost/check-user",
    JSON.stringify({userId: 1}),
    {headers: {"Content-Type": "application/json"}}
  );
  check(res, {"is status 200": (r) => r.status === 200});
  sleep(1);
}
