// Settings and fixed lists used across the app.
const C={"Chennai":[80.3,13.1],"Madurai":[78.1,9.9],"Bengaluru":[77.6,13],"Dubai":[55.3,25.2],"London":[-0.1,51.5],"New York":[-74,40.7],"San Francisco":[-122.4,37.8],"Toronto":[-79.4,43.7],"Singapore":[103.8,1.4],"Sydney":[151.2,-33.9]};

// Demo staff accounts (passwords stored as hashes). Replace with real accounts managed on a backend.
const STAFF = [
  {reg:"SUPERADMIN",n:"Super Admin",role:"super",title:"Super Admin",dept:0,h:"005f59a7e58e"},
  {reg:"ADMIN01",n:"Platform Admin",role:"admin",title:"Admin",dept:0,h:"dd28ba4756ee"},
  {reg:"FAC001",n:"Dr. Ramesh Kumar",role:"faculty",title:"Faculty mentor",dept:0,h:"7f5a804a6b03"},
  {reg:"FAC002",n:"Dr. Priya Lakshmi",role:"faculty",title:"Faculty mentor",dept:1,h:"e7483adec7aa"},
  {reg:"FAC003",n:"Dr. Suresh Babu",role:"faculty",title:"Faculty mentor",dept:2,h:"c0d557f4b477"}
];

const COLLEGE = "Demo Engineering College";
const MAX_SHARE = 1024 * 1024 * 1024; // largest file that can be sent in a chat (1 GB)
const MAX_RESUME = 100 * 1024 * 1024; // largest resume (100 MB)
