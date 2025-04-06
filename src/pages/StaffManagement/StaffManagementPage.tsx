import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, UserPlus, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StaffManagementPage = () => {
  const { staffMembers, addStaffMember, updateStaffMember, deleteStaffMember, currentUser } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('staff');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [editingStaff, setEditingStaff] = useState<{ id: string; name: string; role: UserRole; password?: string } | null>(null);
  const [passwordStaff, setPasswordStaff] = useState<{ id: string; name: string; password: string } | null>(null);

  const handleAddStaff = () => {
    if (!newStaffName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a staff name',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    if (!newStaffPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a password for the staff',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    if (staffMembers.some(staff => staff.name.toLowerCase() === newStaffName.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'A staff member with this name already exists',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    addStaffMember(newStaffName, newStaffRole, newStaffPassword);
    setNewStaffName('');
    setNewStaffRole('staff');
    setNewStaffPassword('');
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Added new staff member: ${newStaffName}`,
      duration: 1000,
    });
  };

  const openEditDialog = (staff: { id: string; name: string; role: UserRole }) => {
    setEditingStaff(staff);
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (staff: { id: string; name: string }) => {
    setPasswordStaff({
      id: staff.id,
      name: staff.name,
      password: ''
    });
    setIsPasswordDialogOpen(true);
  };

  const handleEditStaff = () => {
    if (!editingStaff) return;
    
    if (!editingStaff.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a staff name',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    if (staffMembers.some(
      staff => staff.id !== editingStaff.id && 
      staff.name.toLowerCase() === editingStaff.name.toLowerCase()
    )) {
      toast({
        title: 'Error',
        description: 'A staff member with this name already exists',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    updateStaffMember(editingStaff.id, editingStaff.name, editingStaff.role);
    setIsEditDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Updated staff member: ${editingStaff.name}`,
      duration: 1000,
    });
  };

  const handleUpdatePassword = () => {
    if (!passwordStaff) return;
    
    if (!passwordStaff.password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a password',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    updateStaffMember(passwordStaff.id, passwordStaff.name, 
      staffMembers.find(staff => staff.id === passwordStaff.id)?.role || 'staff',
      passwordStaff.password);
    
    setIsPasswordDialogOpen(false);
    
    toast({
      title: 'Success',
      description: `Updated password for ${passwordStaff.name}`,
      duration: 1000,
    });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    const success = deleteStaffMember(id);
    
    if (success) {
      toast({
        title: 'Success',
        description: `Deleted staff member: ${name}`,
        duration: 1000,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Cannot delete this staff member',
        variant: 'destructive',
        duration: 1000,
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
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    type="password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    placeholder="Enter staff password"
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
                      title="Edit Staff"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openPasswordDialog(staff)}
                      title="Change Password"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      disabled={staff.role === 'owner' || currentUser?.id === staff.id}
                      title="Delete Staff"
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

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update password for {passwordStaff?.name}
            </DialogDescription>
          </DialogHeader>
          {passwordStaff && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordStaff.password}
                  onChange={(e) => setPasswordStaff({...passwordStaff, password: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-mir-red hover:bg-mir-red/90" onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StaffManagementPage;
