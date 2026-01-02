# TV-Owl — Distributed Video Streaming Platform

<div align="center">
  <img src="https://github.com/user-attachments/assets/bdb0ee00-e0fd-4f30-b156-d9522ee5da5e" alt="tvowl_src_image" width="500" height="500" />
</div>

TV-Owl is a distributed, cloud-native video streaming platform designed to handle large video uploads, asynchronous transcoding, metadata-driven publishing, and social engagement features. The system is built using a service-oriented and event-driven architecture to ensure scalability, fault isolation, and performance under CPU-intensive workloads.

### Website
[https://tv-owl.vercel.app/home](https://tv-owl.vercel.app/home)



## Overview

TV-Owl supports the complete lifecycle of a video:
- Multipart upload
- Background transcoding into multiple formats
- Metadata publication
- Feed distribution
- User engagement through reactions, comments, subscriptions, and notifications

The platform separates compute-heavy video processing from API-facing services, ensuring responsiveness and scalability.

---

## Key Features

### Video Processing
- Multipart video upload
- Asynchronous FFmpeg-based transcoding
- Multi-resolution format publishing
- Metadata-driven video availability

### Feed & Discovery
- Paginated video feed
- Related video recommendations
- User-specific video listings

### Social & Engagement
- Like and dislike reactions
- Comment system
- Channel subscriptions
- User notifications

---

## System Architecture

TV-Owl is composed of multiple loosely coupled services that communicate via APIs and background queues.

### Architecture Diagrams
<img width="1536" height="1024" alt="tv-owl-architecture" src="https://github.com/user-attachments/assets/0c3473e4-d312-44c7-a680-9609bf78e378" />

---

## Tech Stack

### Frontend
- React
- Next.js
- TypeScript

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB

### Infrastructure
- FFmpeg
- Docker
- AWS-compatible object storage
- Queue-based background processing

---

## API Overview

### Upload & Video Management

```http
POST   /video/submit-video
POST   /video/start-upload
POST   /video/part-upload
POST   /video/complete-upload
GET    /video/:videoId
DELETE /video/:videoId
```

### Transcoding and Publishing

```http
POST /transcoder/add-to-queue
POST /video/publish-formats
POST /video-metadata/mark-metadata-publish
```

### Metadata and Feed

```http
GET /video-metadata/:videoId
GET /video-metadata/feed
GET /video-metadata/related-videos/:videoId
GET /video-metadata/user-videos/:userId
```

### Reactions

```http
POST /reaction
GET  /reaction/count
GET  /reaction/user
```

### Comments

```http
POST /comment
GET  /comment
```

### Subscriptions

```http
POST /subscription/toggle
GET  /subscription/is-subscribed
```

### Notifications

```http
POST /notification
GET  /notification
```

### Users

```http
GET /user/:userId
```

## Performance Characteristics
- Transcoding is CPU-intensive and may utilize 90–99% CPU during active processing
- API services remain responsive due to background job isolation
- Processing is event-driven to avoid synchronous bottlenecks

## Future Improvements
- Adaptive bitrate streaming (HLS / DASH)
- Redis-backed job queues (BullMQ)
- Authentication and authorization
- Watch history and recommendation engine
- Creator analytics dashboard

## Author
Ujjawal Gusain -
ujjawalgusain31@gmail.com
