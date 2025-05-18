import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  type: z.string().min(1, "Coach type is required"),
  coachNumber: z.string().min(1, "Coach number is required"),
  seatsPerCoach: z.string().min(1, "Seats per coach is required"),
  totalSeats: z.string().min(1, "Total seats is required"),
  status: z.string().min(1, "Status is required"),
});

interface EditBerthFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  berth: any;
}

export function EditBerthForm({ open, onOpenChange, berth }: EditBerthFormProps) {
  const { useManageBerth } = useAdmin();
  const manageBerth = useManageBerth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: berth.type,
      coachNumber: berth.coachNumber.toString(),
      seatsPerCoach: berth.seatsPerCoach.toString(),
      totalSeats: berth.totalSeats.toString(),
      status: berth.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await manageBerth.mutateAsync({
        action: "update",
        data: {
          id: berth.id,
          type: values.type,
          coachNumber: parseInt(values.coachNumber),
          seatsPerCoach: parseInt(values.seatsPerCoach),
          totalSeats: parseInt(values.totalSeats),
          status: values.status,
        }
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update berth:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Berth</DialogTitle>
          <DialogDescription>
            Update the berth details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coach Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coach type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sleeper">Sleeper</SelectItem>
                      <SelectItem value="ac_3tier">AC 3 Tier</SelectItem>
                      <SelectItem value="ac_2tier">AC 2 Tier</SelectItem>
                      <SelectItem value="ac_first">AC First Class</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coachNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coach Number</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seatsPerCoach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats Per Coach</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Seats</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={manageBerth.isPending}>
                {manageBerth.isPending ? "Updating..." : "Update Berth"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 