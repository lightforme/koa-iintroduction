const bcrypt = require('bcrypt')
const config = require('config')

const saltRounds = config.get('saltRounds') // 加密强度
const { accountModel } = require('../../models')
const helper = require('./helper')
const {
    signup,
    accountUpdate,
    queryByName,
    queryById
} = require('./validate.js')

module.exports = {
    signUp: async (ctx, next) => {
        const validateRes = helper.joiValite('request body')(ctx.request.body, signup)
        if(validateRes) {
            ctx.body = validateRes
            return 
        }

        const {
            accountName,
            accountPwd
        } = ctx.request.body

        const result = await accountModel.findOne({ accountName })

        if(result) {
            // 数据库中已存在该账户名
            ctx.body = {
                status: false,
                message: '已存在该用户名'
            }
            return 
        }
        
        const hashPwd = await bcrypt.hash(accountPwd, saltRounds)
        const cResult = await accountModel.create({
            accountName,
            accountPwd: hashPwd
        })

        if(cResult.errors) {
            console.errorsor('插入失败', cResult.errors)
            ctx.body = {
                status: false,
                message: '数据插入失败'
            }
        } else {
            ctx.body = {
                status: true,
                message: '数据插入成功'
            }
        }

    },
    signIn: async (ctx, next) => {
        const validateRes = helper.joiValite('request body')(ctx.request.body, signup)
        if(validateRes) {
            ctx.body = validateRes
            return 
        }

        const {
            accountName,
            accountPwd
        } = ctx.request.body

        const res = await accountModel.findOne({
            accountName
        })
        if (bcrypt.compareSync(accountPwd, res.accountPwd)) {
            ctx.body = {
                status: true,
                message: '登录成功'
            }
            return 
        }
        ctx.body = {
            status: false,
            message: '用户名或密码出错'
        }
        return
    },
    update: async (ctx, next) => {
        const validateRes = helper.joiValite('request body')(ctx.request.body, accountUpdate)
        if(validateRes) {
            ctx.body = validateRes
            return 
        }

        const {
            accountName,
            accountPwd,
            newPwd
        } = ctx.request.body

        const res = await accountModel.findOne({
            accountName
        })

        if(!bcrypt.compareSync(accountPwd, res.accountPwd)) {
            ctx.body = {
                status: false,
                message: '用户名或密码出错'
            }
            return 
        }
        const hashPwd = await bcrypt.hash(newPwd, saltRounds)
        const uRes = await accountModel.updateOne({ accountName }, { accountPwd: hashPwd })
        if(uRes.errors) {
            ctx.body = {
                status: false,
                message: '更新失败'
            }
            return 
        }
        ctx.body = {
            status: true,
            message: '数据更新成功'
        }
        return 
    },
    queryAccount: async (ctx, _) => {
        try {
            const validateRes = helper.joiValite('request query')(ctx.request.query, queryByName)
            if(validateRes) {
                ctx.body = validateRes
                return 
            }

            const {
                name
            } = ctx.request.query
            
            const result = await accountModel.findOne({
                accountName: name
            })

            ctx.body = result
        } catch (error) {
            throw error
        }
    },
    queryById: async (ctx, _) => {
        try {
            const validateRes = helper.joiValite('request query')(ctx.request.query, queryById)
            if(validateRes) {
                ctx.body = validateRes
                return 
            }

            const {
                id
            } = ctx.request.query

            // console.log(ObjectId(id))
            const result = await accountModel.findById({
                _id: id // 或者可以转换为ObjectId
            })

            ctx.body = result
        } catch (error) {
            throw error
        }
    }
}