import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserPlus } from 'lucide-react';
import { usersService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/utils';
import type { User, UserRole } from '@/types';

const roleConfig: Record<string, { variant: 'info' | 'success' | 'warning' | 'danger'; label: string }> = {
  ADMIN: { variant: 'danger', label: 'Admin' },
  REP: { variant: 'info', label: 'Representante' },
  CLIENT: { variant: 'success', label: 'Cliente' },
};

export function UsersManagementPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'CLIENT' as UserRole, password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await usersService.getAll();
      setUsers(data.data);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los usuarios' });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'CLIENT', password: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'Nombre y email son requeridos' });
      return;
    }
    if (!editingUser && !formData.password) {
      addToast({ type: 'error', title: 'Error', message: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          name: formData.name.trim(),
          role: formData.role,
        });
        addToast({ type: 'success', title: 'Usuario actualizado', message: `${formData.name} ha sido actualizado.` });
      } else {
        await usersService.create({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          password: formData.password,
        });
        addToast({ type: 'success', title: 'Usuario creado', message: `${formData.name} ha sido creado.` });
      }
      setShowModal(false);
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el usuario' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Estas seguro de que deseas eliminar a ${user.name}?`)) return;
    try {
      await usersService.delete(user.id);
      addToast({ type: 'success', title: 'Usuario eliminado', message: `${user.name} ha sido eliminado.` });
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el usuario' });
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'REP', label: 'Representante' },
    { value: 'CLIENT', label: 'Cliente' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion de Usuarios"
        description="Administra los usuarios del sistema."
        actions={
          <Button onClick={openCreateModal} leftIcon={<UserPlus className="h-4 w-4" />}>
            Nuevo Usuario
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="No hay usuarios"
              description="No se encontraron usuarios registrados."
              icon={<Plus className="h-16 w-16" />}
              action={
                <Button onClick={openCreateModal} leftIcon={<UserPlus className="h-4 w-4" />}>
                  Crear Usuario
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell as="th">Nombre</TableCell>
                  <TableCell as="th">Email</TableCell>
                  <TableCell as="th">Rol</TableCell>
                  <TableCell as="th">Estado</TableCell>
                  <TableCell as="th">Creado</TableCell>
                  <TableCell as="th" className="text-right">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const role = roleConfig[user.role] || roleConfig.CLIENT;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={role.variant}>{role.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'default'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={editingUser ? 'Modifica los datos del usuario.' : 'Completa los datos para crear un nuevo usuario.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Juan Perez"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="juan@email.com"
            disabled={!!editingUser}
            required
          />
          {!editingUser && (
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          )}
          <Select
            label="Rol"
            options={roleOptions}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          />
        </form>
      </Modal>
    </div>
  );
}
