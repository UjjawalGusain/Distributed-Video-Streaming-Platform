'use client'
import React from 'react'
import { AxiosError } from 'axios'
import { ApiResponse } from '@/src/types/ApiResponse'
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { toast } from "sonner"
import { signOut } from 'next-auth/react'

const SignOutButton = () => {
  const onSubmit = async () => {
    try {
      await signOut("http://localhost:3000/");
    } catch (error) {
      toast("Failed", { description: `Error in signin in from google: ${error}` })
    }
  }

  return (
      <Button variant={"outline"} onClick={onSubmit}>Sign Out</Button>
  )
}

export default SignOutButton
