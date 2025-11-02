'use client'
import React from 'react'
import { AxiosError } from 'axios'
import { ApiResponse } from '@/src/types/ApiResponse'
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { toast } from "sonner"
import { signIn } from 'next-auth/react'

const Page = () => {
  const onSubmit = async () => {
    try {
      await signIn("google");
    } catch (error) {
      toast("Failed", { description: `Error in signin in from google: ${error}` })
    }
  }

  return (
    <div>
      <Button onClick={onSubmit}>Button</Button>
    </div>
  )
}

export default Page
