// Puts trigger notifications (for Actions) into a queue so we can limit the
// rate at which they fire. This prevents system over-run when a large amount of
// triggers are fired simultaneously.

const THROTTLE_TIME = 10000
const QUEUE_LENGTH_THRESHOLD = 3

type EventObject<T> = { data: object; action: (data: object) => Promise<T> }

export class TriggerThrottle<T> {
  queue: EventObject<T>[]
  timerId: NodeJS.Timeout | undefined

  constructor() {
    this.queue = []
    // this.timerId = setInterval(this.runNext, THROTTLE_TIME)
  }

  runNext = () => {
    console.log('Checking...')
    const next = this.queue.shift()
    if (next) {
      const { data, action } = next
      console.log('Timer reaching, running another')
      action(data)
      console.log(`${this.queue.length} events remaining`)
    }
    if (this.queue.length > 0) {
      console.log('Events in queue, setting new timer')
      if (this.timerId) clearTimeout(this.timerId)
      this.timerId = undefined
      setTimeout(this.runNext, THROTTLE_TIME)
    } else if (this.timerId) {
      console.log('Queue empty, resetting')
      clearTimeout(this.timerId)
      this.timerId = undefined
      //   console.log('Timer after clear', this.timerId)
    }
  }

  public add(event: EventObject<T>): void {
    if (!this.timerId) {
      const { data, action } = event
      console.log('No queue, running immediately')
      action(data)
      this.timerId = setTimeout(this.runNext, THROTTLE_TIME)
    } else {
      console.log('Queue exists, waiting')
      this.queue.push(event)
    }
  }
}
