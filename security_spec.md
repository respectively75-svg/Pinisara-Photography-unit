# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Path ID Integrity**: Every document ID path variable (`userId`, `photoId`, `commentId`, `reactionId`, `eventId`) must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
2. **Photo Reaction Summary Integrity (`/photoReactions/{photoId}`)**:
   - Must contain strictly bounded integer/number counters (`heart >= 0`, `clap >= 0`, `fire >= 0`, `star >= 0`, `totalCount >= 0`) and `photoId == photoId`.
   - Rejects any shadow or arbitrary keys outside `['photoId', 'heart', 'clap', 'fire', 'star', 'totalCount', 'updatedAt']`.
3. **Photo Comment Integrity (`/photos/{photoId}/comments/{commentId}`)**:
   - Must have valid string `text` (`1 <= size <= 600`), `authorName` (`1 <= size <= 100`), `photoId`, non-negative reaction counters (`heartCount`, `clapCount`, `fireCount`), and valid `reactionTag` in `['heart', 'clap', 'fire', 'star', 'none']`.
   - Updates to comments can only modify `['heartCount', 'clapCount', 'fireCount']`.
4. **Individual Reaction Event Integrity (`/photos/{photoId}/reactions/{reactionId}`)**:
   - `type` must be strictly in `['heart', 'clap', 'fire', 'star']`.
   - `userName` length `<= 100`, `userId` length `<= 128`.
5. **PII Isolation (`/users/{userId}/private/{privateId}`)**:
   - Strictly readable and writable only by `isOwner(userId)` or `isAdmin()`.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on PhotoReactionSummary**: `{ photoId: "photo-01", heart: 10, clap: 5, fire: 8, star: 2, totalCount: 25, updatedAt: "...", isAdmin: true }` -> `PERMISSION_DENIED`
2. **Negative Reaction Counter Poisoning**: `{ photoId: "photo-01", heart: -500, clap: 0, fire: 0, star: 0, totalCount: -500, updatedAt: "..." }` -> `PERMISSION_DENIED`
3. **Invalid Reaction Type Enum**: `{ id: "rx-1", photoId: "photo-01", userId: "u1", userName: "User", type: "hacked_emoji", createdAt: "..." }` -> `PERMISSION_DENIED`
4. **Oversized Comment Payload (10KB Text)**: `{ id: "c1", photoId: "photo-01", authorId: "u1", authorName: "Bob", text: "A".repeat(10000), heartCount: 0, clapCount: 0, fireCount: 0, createdAt: "..." }` -> `PERMISSION_DENIED`
5. **Comment Text Mutation via Reaction Update**: Updating `text` on an existing comment when only reaction counters (`heartCount`, `clapCount`, `fireCount`) are mutable -> `PERMISSION_DENIED`
6. **Unauthorized Private PII Read**: Authenticated non-owner reading `/users/otherUser/private/info` -> `PERMISSION_DENIED`
7. **Unauthorized Event Deletion**: Non-admin attempting to delete `/events/evt-main-assembly-2026` -> `PERMISSION_DENIED`
8. **Invalid Document ID Injection**: Creating a photo or reaction with special characters or `> 128` chars in ID -> `PERMISSION_DENIED`
9. **Unverified Email Admin Spoofing**: Token with `email == "respectively75@gmail.com"` but `email_verified == false` attempting admin delete -> `PERMISSION_DENIED`
10. **User Role Escalation**: User creating profile with invalid role `"super_hacker"` -> `PERMISSION_DENIED`
11. **Missing Required Keys on Comment Create**: Omitting `authorName` or `text` -> `PERMISSION_DENIED`
12. **Catch-all Unmapped Collection Write**: Writing to `/unmappedCollection/doc1` -> `PERMISSION_DENIED`
