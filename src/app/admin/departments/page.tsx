"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { BJPLogo } from "@/components/BJPLogo";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  whatsapp_numbers: string[];
  sms_numbers: string[];
  email_addresses: string[];
  is_active: boolean;
}

export default function DepartmentsManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    whatsapp_numbers: "",
    sms_numbers: "",
    email_addresses: ""
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const departmentData = {
      ...formData,
      whatsapp_numbers: formData.whatsapp_numbers.split(",").map(n => n.trim()).filter(n => n),
      sms_numbers: formData.sms_numbers.split(",").map(n => n.trim()).filter(n => n),
      email_addresses: formData.email_addresses.split(",").map(e => e.trim()).filter(e => e)
    };

    try {
      const url = editingDept 
        ? `/api/admin/departments/${editingDept.id}`
        : "/api/admin/departments";
      
      const method = editingDept ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(departmentData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingDept ? "Department updated!" : "Department created!");
        setShowAddModal(false);
        setEditingDept(null);
        setFormData({
          name: "",
          code: "",
          description: "",
          whatsapp_numbers: "",
          sms_numbers: "",
          email_addresses: ""
        });
        fetchDepartments();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Failed to save department");
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      whatsapp_numbers: dept.whatsapp_numbers?.join(", ") || "",
      sms_numbers: dept.sms_numbers?.join(", ") || "",
      email_addresses: dept.email_addresses?.join(", ") || ""
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Department deleted!");
        fetchDepartments();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <BJPLogo size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-white">Department Management</h1>
              <p className="text-white/60">Manage departments and officer contacts</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingDept(null);
              setFormData({
                name: "",
                code: "",
                description: "",
                whatsapp_numbers: "",
                sms_numbers: "",
                email_addresses: ""
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{dept.name}</h3>
                      {dept.is_active ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-white/40 text-sm uppercase tracking-wide mb-2">
                      Code: {dept.code}
                    </p>
                    {dept.description && (
                      <p className="text-white/60 text-sm">{dept.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 text-white/60 hover:text-[#FF6B00] hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="p-2 text-white/60 hover:text-red-500 hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {dept.whatsapp_numbers && dept.whatsapp_numbers.length > 0 && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs mb-1">WhatsApp Numbers</p>
                        <div className="flex flex-wrap gap-2">
                          {dept.whatsapp_numbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {dept.sms_numbers && dept.sms_numbers.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs mb-1">SMS Numbers</p>
                        <div className="flex flex-wrap gap-2">
                          {dept.sms_numbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {dept.email_addresses && dept.email_addresses.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/40 text-xs mb-1">Email Addresses</p>
                        <div className="flex flex-wrap gap-2">
                          {dept.email_addresses.map((email, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded"
                            >
                              {email}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(!dept.whatsapp_numbers || dept.whatsapp_numbers.length === 0) &&
                   (!dept.sms_numbers || dept.sms_numbers.length === 0) &&
                   (!dept.email_addresses || dept.email_addresses.length === 0) && (
                    <p className="text-white/40 text-sm italic">No contact information added</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morphism rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingDept ? "Edit Department" : "Add New Department"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Department Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50"
                      placeholder="e.g., Roads & Footpaths"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Department Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50"
                      placeholder="e.g., roads"
                      disabled={!!editingDept}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50"
                    placeholder="Brief description of department responsibilities"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    WhatsApp Numbers (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp_numbers}
                    onChange={(e) => setFormData({ ...formData, whatsapp_numbers: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50"
                    placeholder="e.g., 919876543210, 919876543211"
                  />
                  <p className="text-white/40 text-xs mt-1">Include country code, no + or spaces</p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    SMS Numbers (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sms_numbers}
                    onChange={(e) => setFormData({ ...formData, sms_numbers: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50"
                    placeholder="e.g., 919876543210, 919876543211"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Addresses (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.email_addresses}
                    onChange={(e) => setFormData({ ...formData, email_addresses: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]/50"
                    placeholder="e.g., officer1@kdmc.gov.in, officer2@kdmc.gov.in"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#D4AF37] text-white font-semibold hover:shadow-lg transition-all"
                  >
                    {editingDept ? "Update Department" : "Create Department"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingDept(null);
                    }}
                    className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
