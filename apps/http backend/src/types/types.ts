import {z} from "zod"

export const signupSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    username:z.string().min(4)
})

export const signinSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})