/**
 * Throttle provides a mechanism to prevent certain functions from being called
 * too many times in rapid succession. Used to limit too many simultaneous
 * Action Triggers. This can happen (for example) when many thousands of
 * products are set to expire at the exact same time. Without this safeguard,
 * the system is overrun with simultaneous actions which causes numerous errors.
 *
 * The throttle captures all the function calls (using the .add method), but,
 * when multiple calls are made in quick succession, they are put in a queue so
 * they can be executed with appropriate time spacing (using the .runNext
 * method).
 */

/**
 * Time between subsequent function calls when queued
 */
const THROTTLE_SPACING = 1500 // ms

/**
 * Only "add" events captured within this time since the last addition are
 * queued -- all others are executed immediately. This way, a large in-progress
 * queue won't prevent additional actions being run, otherwise users would
 * experience trigger timeouts due to their event being put at the back of the
 * queue.
 */
const THROTTLE_QUEUE_THRESHOLD = 500 // ms

type EventObject<T, U> = { name: string; data: T; action: (data: T) => Promise<U> | U }

export class EventThrottle<T, U> {
  queue: EventObject<T, U>[]
  timerId: NodeJS.Timeout | undefined
  lastAdded: number

  constructor() {
    this.queue = []
    this.lastAdded = 0
  }

  runNext = () => {
    const next = this.queue.shift()
    if (next) {
      const { data, action, name } = next
      console.log('Processing queued event', name)
      action(data)
      console.log(`${this.queue.length} events remaining in queue`)
    }

    // Keep looping over this method as long as there are items in the queue
    if (this.queue.length > 0) {
      if (this.timerId) clearTimeout(this.timerId)
      this.timerId = undefined
      this.timerId = setTimeout(this.runNext, THROTTLE_SPACING)
    } else if (this.timerId) {
      console.log('Throttle queue empty')
      clearTimeout(this.timerId)
      this.timerId = undefined
    }
  }

  public add(event: EventObject<T, U>): void {
    if (!this.timerId) {
      // No timer means nothing is waiting, so we run immediately, and start a
      // timer to determine when additional events are allowed to run
      const { data, action, name } = event
      console.log('Processing:', name)
      action(data)
      this.timerId = setTimeout(this.runNext, THROTTLE_SPACING)
      this.lastAdded = Date.now()
    } else if (Date.now() - this.lastAdded > THROTTLE_QUEUE_THRESHOLD) {
      // We can run action immediately if THROTTLE_QUEUE_THRESHOLD has elapsed
      // since the last .add()
      const { data, action, name } = event
      console.log('Processing:', name)
      action(data)
      this.lastAdded = Date.now()
    } else {
      console.log('Queuing: ', event.name)
      this.queue.push(event)
    }
  }
}
