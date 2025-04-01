
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StaffManagementPage = () => {
  const { staffMembers, addStaffMember, updateStaffMember, deleteStaffMember, currentUser } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('staff');
  const [editingStaff, setEditingStaff] = useState<{ id: string; name: string; role: UserRole } | null>(null);

  const handleAddStaff = () => {
    if (!newStaffName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a staff name',
        variant: 'destructive',
      });
      return;
    }

    // Check if name already exists
    if (staffMembers.some(staff => staff.name.toLowerCase() === newStaffName.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'A staff member with this name already exists',
        variant: 'destructive',
      });
      return;
    }

    addStaffMember(newStaffName, newStaffRole);
    setNewStaffName('');
    setNewStaffRole('staff');
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Added new staff member: ${newStaffName}`,
    });
  };

  const openEditDialog = (staff: { id: string; name: string; role: UserRole }) => {
    setEditingStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleEditStaff = () => {
    if (!editingStaff) return;
    
    if (!editingStaff.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a staff name',
        variant: 'destructive',
      });
      return;
    }

    // Check if name already exists (excluding the current staff being edited)
    if (staffMembers.some(
      staff => staff.id !== editingStaff.id && 
      staff.name.toLowerCase() === editingStaff.name.toLowerCase()
    )) {
      toast({
        title: 'Error',
        description: 'A staff member with this name already exists',
        variant: 'destructive',
      });
      return;
    }

    updateStaffMember(editingStaff.id, editingStaff.name, editingStaff.role);
    setIsEditDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Updated staff member: ${editingStaff.name}`,
    });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    const success = deleteStaffMember(id);
    
    if (success) {
      toast({
        title: 'Success',
        description: `Deleted staff member: ${name}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Cannot delete this staff member',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout title="Staff Management">
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mir-red hover:bg-mir-red/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
                <DialogDescription>
                  Enter the details for the new staff member.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Enter staff name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <Select
                    value={newStaffRole}
                    onValueChange={(value) => setNewStaffRole(value as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-mir-red hover:bg-mir-red/90" onClick={handleAddStaff}>
                  Add Staff
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    {staff.name}
                    {currentUser?.id === staff.id && (
                      <Badge variant="outline" className="ml-2">You</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.role === 'owner' ? 'secondary' : 'outline'}>
                      {staff.role === 'owner' ? 'Owner' : 'Staff'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(staff)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      disabled={staff.role === 'owner' || currentUser?.id === staff.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>
              Update the staff member's details.
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input
                  id="edit-name"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                  placeholder="Enter staff name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium">Role</label>
                <Select
                  value={editingStaff.role}
                  onValueChange={(value) => setEditingStaff({...editingStaff, role: value as UserRole})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-mir-red hover:bg-mir-red/90" onClick={handleEditStaff}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StaffManagementPage;
