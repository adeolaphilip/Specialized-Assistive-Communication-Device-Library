;; Device Registration Contract
;; Records details of communication aids

(define-data-var last-device-id uint u0)

;; Device structure
(define-map devices
  { device-id: uint }
  {
    name: (string-ascii 100),
    description: (string-ascii 500),
    manufacturer: (string-ascii 100),
    category: (string-ascii 50),
    features: (list 10 (string-ascii 50)),
    available: bool,
    owner: principal
  }
)

;; Register a new device
(define-public (register-device
    (name (string-ascii 100))
    (description (string-ascii 500))
    (manufacturer (string-ascii 100))
    (category (string-ascii 50))
    (features (list 10 (string-ascii 50)))
  )
  (let
    (
      (new-id (+ (var-get last-device-id) u1))
    )
    (var-set last-device-id new-id)
    (map-set devices
      { device-id: new-id }
      {
        name: name,
        description: description,
        manufacturer: manufacturer,
        category: category,
        features: features,
        available: true,
        owner: tx-sender
      }
    )
    (ok new-id)
  )
)

;; Get device details
(define-read-only (get-device (device-id uint))
  (map-get? devices { device-id: device-id })
)

;; Update device availability
(define-public (update-availability (device-id uint) (available bool))
  (let
    (
      (device (unwrap! (map-get? devices { device-id: device-id }) (err u1)))
    )
    (asserts! (is-eq tx-sender (get owner device)) (err u2))
    (map-set devices
      { device-id: device-id }
      (merge device { available: available })
    )
    (ok true)
  )
)

;; Transfer device ownership
(define-public (transfer-device (device-id uint) (new-owner principal))
  (let
    (
      (device (unwrap! (map-get? devices { device-id: device-id }) (err u1)))
    )
    (asserts! (is-eq tx-sender (get owner device)) (err u2))
    (map-set devices
      { device-id: device-id }
      (merge device { owner: new-owner })
    )
    (ok true)
  )
)

