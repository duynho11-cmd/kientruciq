/**
 * useCardWipe
 *
 * Khi activeIdx thay đổi, delay wipe animation cho đến sau khi
 * RAF carousel đã settle (tránh conflict với translateX đang chạy).
 * Card mới nhận wipe-in-left/right, card cũ nhận wipe-out ngược chiều.
 */

import { useEffect, useRef } from 'react'

const WIPE_MS   = 620
const SETTLE_MS = 120   // đợi RAF settle trước khi bắt đầu wipe

export function useCardWipe(cardRefs, activeIdx, N) {
  const prevIdxRef  = useRef(activeIdx)
  const timerRef    = useRef(null)
  const settleRef   = useRef(null)

  useEffect(() => {
    const prev = prevIdxRef.current
    if (prev === activeIdx) return
    prevIdxRef.current = activeIdx

    /* Tính hướng ngắn nhất */
    const raw  = activeIdx - prev
    const half = N / 2
    let dir = raw
    if (dir >  half) dir -= N
    if (dir < -half) dir += N

    const wipeIn  = dir > 0 ? 'wipe-in-right' : 'wipe-in-left'
    const wipeOut = dir > 0 ? 'wipe-out-left'  : 'wipe-out-right'

    /* Hủy timers cũ */
    clearTimeout(timerRef.current)
    clearTimeout(settleRef.current)

    /* Xóa tất cả wipe class ngay lập tức để reset trạng thái */
    cardRefs.current.forEach((el) => {
      if (!el) return
      el.classList.remove(
        'wipe-in-left', 'wipe-in-right',
        'wipe-out-left', 'wipe-out-right',
      )
    })

    /* Đợi RAF settle xong mới add class — tránh fight với translateX */
    settleRef.current = setTimeout(() => {
      const newEl = cardRefs.current[activeIdx]
      const oldEl = cardRefs.current[prev]

      newEl?.classList.add(wipeIn)
      oldEl?.classList.add(wipeOut)

      /* Xóa sau khi animation xong */
      timerRef.current = setTimeout(() => {
        newEl?.classList.remove(wipeIn)
        oldEl?.classList.remove(wipeOut)
      }, WIPE_MS + 60)
    }, SETTLE_MS)

    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(settleRef.current)
    }
  }, [activeIdx, cardRefs, N])
}
