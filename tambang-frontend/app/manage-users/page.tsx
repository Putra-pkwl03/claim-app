"use client";
import { useState, useEffect } from "react";
import UserTable from "../components/users/UserTable";
import AddUserModal from "../components/users/AddUserModal";
import { PlusCircleIcon, MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { usePageTitle } from "../../context/PageTitleContext";
import { getUsers, deleteUser } from "../../lib/api/users"; 
import UserSkeleton from "../components/ui/Skeleton"; 
import Toast from "../components/ui/Toast";

export default function ManageUsersPage() {
  const { setTitle } = usePageTitle();

  const [isModalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const filteredUsers = users.filter(user => {
  const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase());

  const matchesRole = roleFilter
    ? user.role?.toLowerCase() === roleFilter.toLowerCase()
    : true;

  return matchesSearch && matchesRole;
});

  useEffect(() => {
    setTitle("Manage Users");
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await getUsers();
      setUsers(data.users || data);
    } catch (err) {
      console.error("Error fetch users:", err);
      setToast({ message: "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  }

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));

    setToast(null); 
    setTimeout(() => {
      setToast({ message: "User deleted successfully!", type: "success" });
    }, 50);
  } catch (err: any) {
    setToast(null);
    setTimeout(() => {
      setToast({ message: err.message || "Failed to delete user", type: "error" });
    }, 50);
  }
};
  const handleEdit = (user: any) => {
    setEditUser(user); 
    setModalOpen(true);
  };

  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4 mt-12">
        {/* Search + Filter */}
        <div className="flex gap-2 items-center">
          {/* Search */}
          <div className="relative w-64 bg-white">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-900" />
            <input
              type="text"
              placeholder="Search users..."
              className="text-gray-600 pl-10 pr-3 py-1.5 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter by Role */}
          <div className="relative bg-white">
            <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-900" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-gray-600 pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 transition cursor-pointer "
            >
              <option value="" className="hover:bg-gray-100 ">All Roles</option>
              <option value="admin">Admin</option>
              <option value="contractor">Contractor</option>
              <option value="surveyor">Surveyor</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        {/* Add User Button */}
        <button
          onClick={() => {
            setEditUser(null); 
            setModalOpen(true);
          }}
          className="flex items-center gap-2 
            bg-blue-500/20 backdrop-blur-md text-blue-900 
            border border-blue-500/40 px-4 py-2 rounded-md 
            hover:bg-blue-500/30 hover:text-blue-800 transition shadow-md cursor-pointer"
        >
          <PlusCircleIcon className="w-6 h-6" />
          <span className="hidden sm:block font-medium">Add User</span>
        </button>
      </div>
        {/* Table / Skeleton */}
        {loading ? (
          <UserSkeleton />
        ) : (
        <UserTable 
          users={filteredUsers} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
        )}

        {/* Modal */}
        {isModalOpen && (
          <AddUserModal 
            setModalOpen={setModalOpen} 
            setUsers={setUsers} 
            editUser={editUser} 
            setToast={setToast} 
          />
        )}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
