# MSGI Alumni One

Alumni network for the Meenakshi Sundararajan Group of Institutions. Alumni and 2nd to 4th year students sign in with their college register number and see a posts feed with photos and videos, reels, announcements and notifications, a directory of members who have joined, a world map, jobs, events, one-to-one messages, profiles and recommendations.

The college dataset (`Final_Formatted_Alumni_Dataset_2008_2029.xlsx`) is the list of people who are allowed to sign in. This is a front-end prototype: connections, messages, jobs, events, profile edits and photos are saved in the browser's localStorage and shared between accounts signed in on the same device (and between tabs). They are not shared between different devices until a backend is added.

## Run it

Open `index.html` in a browser, or serve the folder:

    npx serve .

## Two designs

- **Phone (under 1000px wide):** splash screen, login, bottom tab bar (Home, Network, Jobs, Events, Profile), full-screen chat. Matches the phone UI model.
- **Laptop (1000px and wider):** split login page with the brand panel, a left sidebar (Home, Network, Jobs, Events, Messages, Alumni Map, Profile), a top bar with search, a two-column dashboard, a card grid for the directory, side-by-side conversation list and chat, and a map with a side panel. It is all in `css/styles.css` (the section "Laptop layout"), with small changes in `js/app.js` and `js/views/messages.js`.

## Sign in

- Register number, for example `2008CSE001`.
- Password: the first 5 letters of the name followed by the year of birth, for example `arunm1990` (name Arun Murugan, born 1990). If the first name is shorter than 5 letters, the first name alone also works (`arun1990`). Capital letters don't matter.
- First-year students can't sign in and see an eligibility message. Alumni and 2nd to 4th year students can.
- The first time someone signs in they land on My Profile to add a photo and their current role. After that they appear in the directory, on the map and in suggestions. People who have never signed in are not shown.

Demo staff accounts (register number / password): `SUPERADMIN` / `superadmin2026`, `ADMIN01` / `admin012026`, `FAC001` / `faculty2026`. Replace these before launch.

## Connections and messages

Connecting is two-sided. A sends an invitation, B sees it under Network and must accept. Only then can they message each other. Nothing is connected or answered automatically.

## Roles and permissions

Every account has one role: Super Admin, Admin, Faculty, Alumnus, Current student or First-year student. `js/roles.js` lists what each role can do. The Super Admin and Admins use the console (`js/views/console.js`) and don't see the alumni network.

- Super Admin: manages Admin accounts, publishes events, changes any role except the Super Admin's, suspends accounts, approves announcements, sees the overview and the audit log.
- Admin: publishes events, changes roles between Faculty, Alumnus and Student, suspends accounts, submits announcements for approval, sees the overview and the audit log. Admins can't change other Admins or the Super Admin.
- Faculty: appears in the directory, connects and messages, and proposes announcements that need approval.
- Alumnus: connects, messages, posts jobs and internships.
- Student: connects, messages, browses jobs and asks for referrals.

Nobody can change their own role. Every administrator action goes in the audit log. Suspended and removed accounts are signed out straight away. **These checks run in the browser, so they only show how the roles behave. The real app must enforce every permission on the backend and in the database.**

## Folder structure

    index.html            page markup
    css/styles.css        all styles (phone and laptop)
    assets/logo.png       MSGI crest (shield logo, transparent background)
    assets/campus.jpg     campus photo used behind the splash and login screens
    js/alumni-data.js     people from the dataset (name, register number, department, batch, password hash)
    js/config.js          cities, college name and demo staff accounts
    js/data.js            builds the people list and holds the app state
    js/shared.js          connections, messages, jobs, events, profiles and photos saved in localStorage
    js/roles.js           roles, permissions and the audit log helper
    js/utils.js           helpers: selectors, avatars, icons, toasts, hashing
    js/media.js           photos and videos saved in IndexedDB (posts only keep a media id)
    js/world-map.js       simplified world outline used by the map
    js/views/             one file per screen
      auth.js               splash, login, sign out
      home.js               quick access buttons and the posts feed
      feed.js               posts, likes, comments and reels
      notices.js            announcements page and notifications page
      recommend.js          "Recommend me" request form
      network.js            directory with search and filters
      jobs.js               jobs board
      events.js             events with registration
      map.js                world map
      messages.js           chat (list and thread, or split view on a laptop)
      profile.js            someone else's profile and recommendations
      myprofile.js          my details, photo, editable profile, role permissions
      console.js            Super Admin and Admin console
    js/events.js          messaging, recommendation, photo and certificate preview events
    js/app.js             router, top bar, tabs and start-up

Scripts are plain files loaded in order from `index.html`; keep that order if you add files.

## The map

`js/world-map.js` is a simplified world outline drawn by hand, because map data could not be downloaded when it was built. It is fine for showing pins, but coastlines are rough. For a zoomable street-level map, replace `js/views/map.js` with Leaflet and OpenStreetMap tiles (needs an internet connection).

## Posts, reels, announcements and notifications

- Home opens with the Quick Access buttons (Messages, Connections, Jobs, Announcements, Reels, Events, Alumni Map, Directory, Notifications) and then the feed of everyone's posts.
- A post can have text, one photo and/or one video (up to 30 MB). Photos are shrunk to 1000 px. Photos and videos are stored in the browser's IndexedDB, so like everything else they are only shared between accounts on the same device until a backend is added.
- Reels shows every video post in a full-height scrolling view. The visible reel plays automatically (muted).
- Announcements lists everything the Super Admin published (or approved), and the bell and the Announcements button show a count of new ones. Faculty can propose an announcement there. Notifications lists connection invitations, unread messages, new events and announcements.

## Jobs, "Recommend me" and file sharing

- Alumni post a vacancy (title, company, location, vacancies, details). Everyone else sees a **Recommend me** button on it.
- Pressing it opens a form prefilled from the person's profile: current location, role, company, experience, skills, qualification, email, phone, link, a note, and a resume (the saved one or a new upload). When sent, the two people are **connected automatically** (the one place where no invitation is needed), a chat opens, and the job poster receives a "Recommendation request" card with all those details and the resume to download. The poster then asks for more details in the chat.
- My Profile has the full details form and a saved resume (up to 100 MB), so the next request is one tap.
- In any chat, the **+** button sends a document, photo or video (up to 1 GB each). Files are kept in the browser's IndexedDB, so like the rest of the data they only reach people on the same device until a backend with file storage is added. Very large files also depend on how much space the browser allows.

## Before a real launch

- The sign-in check runs in the browser, so anyone can download the data file and try passwords offline. A password made from a name and a birth year is easy to guess. Move the check to a backend with rate limiting, and make people change the starting password after their first sign in.
- Add a backend (and file storage for photos and videos) to save connections, messages, posts, jobs, events, profiles and photos, so people on different devices see each other.
- The dataset is marked as fictional test records, and every city is Chennai. Replace it with the real student database before launch.
