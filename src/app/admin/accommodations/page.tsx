'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useAccommodations } from '@/lib/data';
import { getPlaceholderImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccommodationForm } from './_components/accommodation-form';
import type { Accommodation } from '@/lib/types';
import { deleteAccommodation } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

function AccommodationsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-8 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminAccommodationsPage() {
  const { data: accommodations, isLoading } = useAccommodations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEdit = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAccommodation(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAccommodation(null);
  };

  const openDeleteDialog = (id: string) => {
    setAccommodationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!accommodationToDelete) return;
    try {
      await deleteAccommodation(accommodationToDelete);
      toast({
        title: 'Success',
        description: 'Accommodation deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete accommodation.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAccommodationToDelete(null);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8 md:py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
              Manage Accommodations
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Add, edit, or remove accommodations available at the resort.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
        <Card className="mt-8">
          <CardContent className="p-0">
            {isLoading ? <AccommodationsSkeleton /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      Image
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accommodations?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={item.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={getPlaceholderImage(item.images[0]).imageUrl}
                          width="64"
                          data-ai-hint="accommodation image"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.type.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                       <TableCell>{item.capacity} guests</TableCell>
                      <TableCell>₱{item.price_per_night.toFixed(2)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEdit(item)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDeleteDialog(item.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
             {accommodations?.length === 0 && !isLoading && (
              <div className="py-16 text-center text-muted-foreground">
                  No accommodations found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AccommodationForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        accommodation={selectedAccommodation}
      />
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              accommodation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    