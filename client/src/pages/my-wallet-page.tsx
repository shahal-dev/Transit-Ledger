import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import { Wallet, Transaction } from "@shared/types";

const addFundsSchema = z.object({
  provider: z.string().min(1, "Payment provider is required"),
  phoneNumber: z.string().min(11, "Phone number must be at least 11 digits"),
  amount: z.coerce.number().min(50, "Minimum amount is ৳50").max(10000, "Maximum amount is ৳10,000"),
});

type AddFundsFormValues = z.infer<typeof addFundsSchema>;

export default function MyWalletPage() {
  const { useWalletDetails, useAddFunds } = useWallet();
  const { data: walletData, isLoading, error } = useWalletDetails();
  const addFundsMutation = useAddFunds();
  
  const form = useForm<AddFundsFormValues>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: {
      provider: "",
      phoneNumber: "",
      amount: 100,
    },
  });
  
  const onSubmit = (data: AddFundsFormValues) => {
    addFundsMutation.mutate(data);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading wallet details...</span>
        </div>
      </div>
    );
  }
  
  if (error || !walletData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <span className="material-icons text-destructive text-4xl mb-2">error_outline</span>
          <h3 className="text-lg font-semibold mb-2">Error Loading Wallet</h3>
          <p className="text-neutral">{error?.message || "Wallet not found"}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>My Wallet | TransitLedger</title>
        <meta name="description" content="Manage your TransitLedger wallet, add funds, and view transaction history." />
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-neutral-lightest p-6 rounded-md text-center mb-2">
                <p className="text-sm text-neutral mb-1">Current Balance</p>
                <p className="text-4xl font-bold text-primary">৳{walletData.balance}</p>
              </div>
              
              <div className="text-sm text-neutral mt-4">
                <p>Use your wallet balance to book train tickets quickly without having to make a payment each time.</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Add Funds Form */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Add Funds</CardTitle>
              <CardDescription>Top up your wallet using mobile banking</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="01XXXXXXXXX" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (৳)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter amount" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark"
                    disabled={addFundsMutation.isPending}
                  >
                    {addFundsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Add Funds"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Transaction History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              {walletData.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons text-neutral text-4xl mb-2">receipt_long</span>
                  <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                  <p className="text-neutral">Add funds or book tickets to see your transaction history.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {walletData.transactions.map((transaction) => (
                    <Card key={transaction.id} className="overflow-hidden">
                      <div className="flex">
                        <div className={`w-1 ${transaction.type === 'credit' ? 'bg-success' : 'bg-secondary'}`}></div>
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-neutral">{formatDate(transaction.createdAt)}</p>
                            </div>
                            <div className={`font-semibold ${transaction.type === 'credit' ? 'text-success' : 'text-secondary'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}৳{transaction.amount}
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-neutral">
                            <div>Payment Method: {transaction.paymentMethod || 'N/A'}</div>
                            <div className="px-2 py-0.5 bg-neutral-lightest rounded-full">
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
