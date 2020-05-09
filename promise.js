class Jk {

    // 在类里面指的是   strict严格模式

    static PENDING = 'pending'
    static FULFILLED = 'success'
    static REJECTED = 'rejected'
    constructor(exc) {
        this.status = Jk.PENDING
        this.value = null
        // console.log(this)//jk  

        this.callbacks = [] //这个是用来解决问题的，解决的是异步resolve的情况，此时会直接执行then函数，所以必须加个cb来控制



        // 出问题的时候  就要拒绝
        try {
            exc(this.resolve.bind(this), this.reject.bind(this))
        } catch (e) {
            this.reject(e)
        }
    }
    resolve(value) {
        // 状态改变后不能改变
        if (this.status == Jk.PENDING) {
            this.status = Jk.FULFILLED
            this.value = value
            // 解决异步resolve情况
            // 把cb里面拿出来执行
            setTimeout(() => {
                this.callbacks.map(cb => {
                    cb.onFulfilled(value)
                })
            });
        }
    }
    reject(reason) {
        if (this.status == Jk.PENDING) {
            this.status = Jk.REJECTED
            this.value = reason
            setTimeout(() => {
                this.callbacks.map(cb => {
                    cb.onRejected(reason)
                })
            });
        }
    }
    then(onFulfilled, onRejected) {
        if (typeof onFulfilled !== 'function') {
            onFulfilled = () => {}
        }
        if (typeof onRejected !== 'function') {
            onRejected = () => {}
        }
        // console.log(this) 还tm是pengding呢
        if (this.status == Jk.PENDING) {
            //  注意这里push的是一个对象
            this.callbacks.push({
                onFulfilled: value => {
                    try {
                        onFulfilled(value)
                    } catch (e) {
                        onRejected(e)
                    }
                },
                onRejected: value => {
                    try {
                        onRejected(value)
                    } catch (e) {
                        onRejected(e)
                    }
                }
            })
        }
        if (this.status == Jk.FULFILLED) {
            setTimeout(() => {
                //把任务做成异步的
                try {
                    onFulfilled(this.value)
                } catch (e) {
                    onRejected(e)
                }
            })
        }

        if (this.status == Jk.REJECTED) {
            setTimeout(() => {
                try {
                    onRejected(this.value)
                } catch (e) {
                    onRejected(e)
                }
            })
        }
    }
}

// new Promise((resolve, reject) => {
//     resolve('js')

// }).then(value=>{

// }, reason => {

// })