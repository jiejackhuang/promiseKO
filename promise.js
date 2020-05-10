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
            onFulfilled = () => this.value
        }
        if (typeof onRejected !== 'function') {
            onRejected = () => this.value
        }
        let promise = new Jk((resolve, reject) => {
            // console.log(this) 还tm是pengding呢
            if (this.status == Jk.PENDING) {
                //  注意这里push的是一个对象
                this.callbacks.push({
                    onFulfilled: value => {
                        this.parse(promise, onFulfilled(value), resolve, reject)
                    },
                    onRejected: value => {
                        this.parse(promise, onRejected(value), resolve, reject)
                    }
                })
            }
            if (this.status == Jk.FULFILLED) {
                setTimeout(() => {
                    //把任务做成异步的
                    // 抽象封装代码，3个以上就要开始封装了
                    this.parse(promise, onFulfilled(this.value), resolve, reject)


                })
            }

            if (this.status == Jk.REJECTED) {
                // 你应该明白，我把这个parse函数放到settimeout里面了，所以他肯定是可以访问都promise变量的

                setTimeout(() => {
                    this.parse(promise, onRejected(this.value), resolve, reject)
                })
            }
        })
        return promise
    }
    parse(promise, res, resolve, reject) {
        if (promise === res) {
            throw new TypeError('Chaining cycle detected jack')
        }
        try {
            // let res = onRejected(this.value)
            if (res instanceof Jk) {
                res.then(resolve, reject)
                // res.then(value => {
                //     // 传递
                //     resolve(value)
                // }, reason => {
                //     reject(reason)
                // })
            } else {
                resolve(res)
            }
        } catch (e) {
            reject(e)
        }
    }
    static resolve(value) {


        return new Jk((resolve, reject) => {
            if (value instanceof Jk) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }
    static reject(value) {
        return new Jk((resolve, reject) => {
            if (value instanceof Jk) {
                value.then(resolve, reject)
            } else {
                reject(value)
            }
        })
    }
}

// new Promise((resolve, reject) => {
//     resolve('js')

// }).then(value=>{

// }, reason => {

// })