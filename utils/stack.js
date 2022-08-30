import store from '@/store/index.js'

class Stack {
    constructor() {
        this.pending_list = []
        this.operation_list = []
        this.status = 'pending'
    }
    first() {
        if (this.pending_list.length > 1) return
        this.write()
    }
    write() {
        if (this.operation_list.length > 0) {
            store.dispatch('writeBLECharacteristicValue', this.operation_list[0])
            return
        }
        if (this.pending_list.length > 0) {
            store.dispatch('writeBLECharacteristicValue', this.pending_list[0])
        }
    }
    on(str, data) {
        if (data != 0) this.operation_list.push(str);
        if (data == 0) this.pending_list.push(str);
        this.first()
    }
    send() {
        if (this.status == 'pending') return
        this.status = 'pending'
        this.write()
    }
    remove(data) {
        this.status = 'resolve'
        if (this.operation_list.length > 0) {
            this.operation_list.map((item, index) => {
                if (item == data) {
                    this.operation_list.splice(index, 1)
                }
            })
        } else {
            this.pending_list.map((item, index) => {
                if (item == data) {
                    this.pending_list.splice(index, 1)
                }
            })
        }
        setTimeout(() => {
            this.send()
        }, 200)
    }

}

export default new Stack()