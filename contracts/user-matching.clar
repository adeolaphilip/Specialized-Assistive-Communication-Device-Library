;; User Matching Contract
;; Connects devices with people having specific needs

(define-data-var last-user-id uint u0)
(define-data-var last-match-id uint u0)

;; User profile structure
(define-map users
  { user-id: uint }
  {
    name: (string-ascii 100),
    needs: (list 10 (string-ascii 50)),
    preferences: (list 10 (string-ascii 50)),
    contact: (string-ascii 100),
    owner: principal
  }
)

;; Match structure
(define-map matches
  { match-id: uint }
  {
    user-id: uint,
    device-id: uint,
    status: (string-ascii 20),
    start-date: uint,
    end-date: (optional uint),
    notes: (string-ascii 500)
  }
)

;; Register a new user
(define-public (register-user
    (name (string-ascii 100))
    (needs (list 10 (string-ascii 50)))
    (preferences (list 10 (string-ascii 50)))
    (contact (string-ascii 100))
  )
  (let
    (
      (new-id (+ (var-get last-user-id) u1))
    )
    (var-set last-user-id new-id)
    (map-set users
      { user-id: new-id }
      {
        name: name,
        needs: needs,
        preferences: preferences,
        contact: contact,
        owner: tx-sender
      }
    )
    (ok new-id)
  )
)

;; Get user details
(define-read-only (get-user (user-id uint))
  (map-get? users { user-id: user-id })
)

;; Create a match between user and device
(define-public (create-match
    (user-id uint)
    (device-id uint)
    (notes (string-ascii 500))
  )
  (let
    (
      (new-id (+ (var-get last-match-id) u1))
      (user (unwrap! (map-get? users { user-id: user-id }) (err u1)))
      (current-time (unwrap! (get-block-info? time (- block-height u1)) (err u3)))
    )
    ;; Check if user is owned by tx-sender
    (asserts! (is-eq tx-sender (get owner user)) (err u2))

    (var-set last-match-id new-id)
    (map-set matches
      { match-id: new-id }
      {
        user-id: user-id,
        device-id: device-id,
        status: "active",
        start-date: current-time,
        end-date: none,
        notes: notes
      }
    )
    (ok new-id)
  )
)

;; End a match
(define-public (end-match (match-id uint))
  (let
    (
      (match (unwrap! (map-get? matches { match-id: match-id }) (err u1)))
      (user (unwrap! (map-get? users { user-id: (get user-id match) }) (err u2)))
      (current-time (unwrap! (get-block-info? time (- block-height u1)) (err u4)))
    )
    ;; Check if user is owned by tx-sender
    (asserts! (is-eq tx-sender (get owner user)) (err u3))

    (map-set matches
      { match-id: match-id }
      (merge match {
        status: "completed",
        end-date: (some current-time)
      })
    )
    (ok true)
  )
)

;; Get match details
(define-read-only (get-match (match-id uint))
  (map-get? matches { match-id: match-id })
)

