'use client'
import React from 'react'
import { AxiosError } from 'axios'
import { ApiResponse } from '@/src/types/ApiResponse'
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { toast } from "sonner"
import { signIn, signOut } from 'next-auth/react'

const SignInButton = () => {
  const onSubmit = async () => {
    try {
      await signIn("google");
    } catch (error) {
      toast("Failed", { description: `Error in signin in from google: ${error}` })
    }
  }

  return (
      <Button variant={"outline"} onClick={onSubmit}>Sign In</Button>
  )
}

export default SignInButton
