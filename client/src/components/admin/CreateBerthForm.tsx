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
  DialogTrigger,
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
import { Plus } from "lucide-react";

const formSchema = z.object({
  trainId: z.string().min(1, "Train is required"),
  type: z.string().min(1, "Coach type is required"),
  coachNumber: z.string().min(1, "Coach number is required"),
  seatsPerCoach: z.string().min(1, "Seats per coach is required"),
  totalSeats: z.string().min(1, "Total seats is required"),
});

export function CreateBerthForm() {
  const [open, setOpen] = useState(false);
  const { useCreateBerth, useAllTrains } = useAdmin();
  const { data: trains } = useAllTrains();
  const createBerth = useCreateBerth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainId: "",
      type: "",
      coachNumber: "",
      seatsPerCoach: "",
      totalSeats: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createBerth.mutateAsync({
        trainId: parseInt(values.trainId),
        type: values.type,
        coachNumber: parseInt(values.coachNumber),
        seatsPerCoach: parseInt(values.seatsPerCoach),
        totalSeats: parseInt(values.totalSeats),
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create berth:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Berth
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Berth</DialogTitle>
          <DialogDescription>
            Add a new berth to the train. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="trainId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Train</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a train" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trains?.map((train: any) => (
                        <SelectItem key={train.id} value={train.id.toString()}>
                          {train.name} ({train.trainNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <DialogFooter>
              <Button type="submit" disabled={createBerth.isPending}>
                {createBerth.isPending ? "Creating..." : "Create Berth"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 