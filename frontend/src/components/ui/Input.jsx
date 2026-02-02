import React, { forwardRef, useState } from "react"
import { cn } from "../../lib/utils"
import { Eye, EyeOff } from "lucide-react"

const Input = forwardRef(({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (isPassword) {
        return (
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1} // Prevent tabbing to the eye icon
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        )
    }

    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
