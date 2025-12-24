
'use client';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorPageProps {
    title: string;
    message: string;
}

const ErrorPage = ({ title, message }: ErrorPageProps) => {
    return (
        <div className="flex justify-center items-center min-h-full p-4">
            <Alert variant="destructive" className="w-full sm:w-96">
                <AlertTitle className="text-2xl font-semibold text-red-600">{title}</AlertTitle>
                <AlertDescription className="text-lg text-gray-800">
                    {message || 'An unexpected error occurred. Please try again later.'}
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default ErrorPage;

