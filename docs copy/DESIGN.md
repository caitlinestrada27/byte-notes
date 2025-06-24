# Design Document

> Written by: Caitlin Estrada, Elizabeth (Lizzie) Coats, Sanjana Gopalswamy, and Yi (Charlotte) Tsui for COMP 426: Modern Web Programming at UNC-Chapel Hill.

## Feature Plan

### Feature 1: Markdown & LaTeX Notes -> Preview

**Description:** Write notes in Markdown and LaTex on the "Edit" tab, then toggle to the "Preview" button to see a polished file. 

**User(s):** Any user with a ByteNote account who wishes to utilize writing notes in Markdown and LaTex

**Purpose:** Quickly convert notation into a formatted, readable document using familiar markup languages

**Technical Notes:** The save button should trigger an action to add the Markdown file to a bucket in the database or update its contents

### Feature 2: Embedded Code Compiler

**Description:** Write and execute code directly in the browser. Dropdown menu to select the language and a "Run" button to quickly see the output.

**User(s):** Any user with a ByteNote account
 
**Purpose:** This allows the user to test code and keep notes on syntax, implementation, etc. coupled with their Markdown notes instead of switching between an online note-taking service and an IDE such as VSCode.

**Technical Notes:** Planning to explore some online compilers. As a backup, Stackblitz offers the option to embed projects in a browser page.

### Feature 3: Create notebooks, chapters, and pages to store notes

**Description:** Users can access their notes on the home page via the sidebar. The sidebar is organized by notebooks with chapters inside and notes inside those chapters. To add a new item, the user presses the +New button and chooses a Notebook, Chapter, or Page then is prompted to choose a name and location for the new file to be stored.

**User(s):** Any users who wants to create multiple notebooks with mutliple chapters and multiple pages.

**Purpose:** Storing notes inside of folders like this allows users to collapse some notes that are not currently relevant and organize their notes by the categories they see fit. 

**Technical Notes:** The notebooks, chapters, and pages are stored in a sidebar. Shadcn has built in designs for sidebars that we took and tweaked to make our prototype. We will reference these docs and any other publically avaliable TypeScript libraries that include documentation on how to create a sidebar in a web application. 

### Feature 4: Profile, Login, Signout

**Description:** User should have a profile with profile picture, username, and password. To access their account they are automatically directed to the login page. If they don't have an account yet, they can sign up for one. Once they're signed in their profile picture is visible and their notes are saved to their profile.

**User(s):** Any student, teacher, professional, or otherwise who wants to use ByteNotes for their Computer Science needs!

**Purpose:** The purpose is to facilitate sharing of notes and save notes behind a password so they are not publically available to non-users when not shared.

**Technical Notes:** The implementation for the profile, login, and signup will rely on the Shadcn built in designs and similar functionality to A06 Oriole. This implementation should be even simpler because ByteNotes will not support followers and following.

### Feature 5: Publish Notes & Share with Friends 

**Description:** User can publish their notes for other users to view and share publicly.

**User(s):** Any student, teacher, professional who wants to share and view each other's notes.

**Purpose:** Allow users to share notes with each other to spread information and ideas. 

**Technical Notes:** For the purposes of simplicity, users will not be able to edit notes that they do not own.

## Backend Database Schema

Pages are organized in a hierarchy of page —> chapter —> notebook, where a page is a single entity consisting of one text and one code file, a chapter is a collection of pages, and a notebook is a collection of chapters. Text and code files themselves are stored in buckets.

![supabase-schema-uyufrtmhbwgoheazioka (2)](https://github.com/user-attachments/assets/13e6f8ae-6573-491c-b59c-02816af351d2)


## High-Fidelity Prototype

[https://www.figma.com/design/0uimSokjWaHRPHdh7h2zzL/Team-03-Wireframes-?node-id=4706-90&t=P1R7eYGloKA17xBQ-1](https://www.figma.com/proto/0uimSokjWaHRPHdh7h2zzL/Team-03-Wireframes!?node-id=4728-153&t=WFSTCrTUN8VRCXRn-1&scaling=scale-down&content-scaling=fixed&page-id=4706%3A90)
