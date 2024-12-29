import { useState } from "react"
import { Button } from "./button.js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialogSkeleton.js"
import { Input } from "./input.js"
import { Label } from "./label.js"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Define the form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface DialogDemoProps {
  initialData?: ProfileFormData
  onSubmit: (data: ProfileFormData) => Promise<void>
  trigger?: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function DialogDemo({
  initialData = {
    name: "",
    username: "",
  },
  onSubmit,
  trigger,
  title = "Edit Profile",
  description = "Make changes to your profile here. Click save when you're done.",
  className,
}: DialogDemoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  })

  const onSubmitHandler = async (data: ProfileFormData) => {
    try {
      setIsLoading(true)
      await onSubmit(data)
      setIsOpen(false)
      reset()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="flex items-center justify-center space-x-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg">
      <span className="font-medium">Start New Session</span>
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className={`sm:max-w-[425px] bg-black/90 backdrop-blur-sm border border-gray-800 shadow-xl ${className}`}>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-300">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-black/50 border-gray-800 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right text-gray-300">
                Username
              </Label>
              <div className="col-span-3">
                <Input
                  id="username"
                  {...register("username")}
                  className="bg-black/50 border-gray-800 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
