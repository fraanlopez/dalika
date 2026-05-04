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
import { useTranslation } from 'react-i18next';
import type { User, UserRole } from '@/types';

const roleConfig: Record<string, { variant: 'info' | 'success' | 'warning' | 'danger'; label: string }> = {
  ADMIN: { variant: 'danger', label: 'role.ADMIN' },
  REP: { variant: 'info', label: 'role.REP' },
  CLIENT: { variant: 'success', label: 'role.CLIENT' },
};

export function UsersManagementPage() {
  const { t } = useTranslation();
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
      addToast({ type: 'error', title: t('users.errorLoading'), message: t('users.errorLoading') });
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
      addToast({ type: 'error', title: t('users.nameEmailRequired'), message: t('users.nameEmailRequired') });
      return;
    }
    if (!editingUser && !formData.password) {
      addToast({ type: 'error', title: t('users.passwordRequired'), message: t('users.passwordRequired') });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          name: formData.name.trim(),
          role: formData.role,
        });
        addToast({ type: 'success', title: t('users.userUpdated'), message: `${formData.name} ${t('users.userUpdated')}` });
      } else {
        await usersService.create({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          password: formData.password,
        });
        addToast({ type: 'success', title: t('users.userCreated'), message: `${formData.name} ${t('users.userCreated')}` });
      }
      setShowModal(false);
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: t('users.errorSave'), message: t('users.errorSave') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(t('users.confirmDelete', { name: user.name }))) return;
    try {
      await usersService.delete(user.id);
      addToast({ type: 'success', title: t('users.userDeleted'), message: `${user.name} ${t('users.userDeleted')}` });
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: t('users.errorDelete'), message: t('users.errorDelete') });
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: t('users.role_admin') },
    { value: 'REP', label: t('users.role_rep') },
    { value: 'CLIENT', label: t('users.role_client') },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('users.manageTitle')}
        description={t('users.manageDescription')}
        actions={
          <Button onClick={openCreateModal} leftIcon={<UserPlus className="h-4 w-4" />}>
            {t('users.newUser')}
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder={t('users.searchPlaceholder')}
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
              title={t('users.noUsers')}
              description={t('users.noUsersDescription')}
              icon={<Plus className="h-16 w-16" />}
              action={
                <Button onClick={openCreateModal} leftIcon={<UserPlus className="h-4 w-4" />}>
                  {t('users.createUser')}
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
                  <TableCell as="th">{t('users.fullName')}</TableCell>
                  <TableCell as="th">{t('users.email')}</TableCell>
                  <TableCell as="th">{t('users.role')}</TableCell>
                  <TableCell as="th">{t('users.status')}</TableCell>
                  <TableCell as="th">{t('users.created')}</TableCell>
                  <TableCell as="th" className="text-right">{t('users.actions')}</TableCell>
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
                        <Badge variant={role.variant}>{t(role.label)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'default'}>
                          {user.isActive ? t('users.active') : t('users.inactive')}
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
        title={editingUser ? t('users.editUser') : t('users.newUser')}
        description={editingUser ? t('users.editDescription') : t('users.createDescription')}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              {t('users.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingUser ? t('users.saveChanges') : t('users.createUser')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('users.fullName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('users.namePlaceholder')}
            required
          />
          <Input
            label={t('users.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t('users.emailPlaceholder')}
            disabled={!!editingUser}
            required
          />
          {!editingUser && (
            <Input
              label={t('users.password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('users.passwordPlaceholder')}
              required
            />
          )}
          <Select
            label={t('users.role')}
            options={roleOptions}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          />
        </form>
      </Modal>
    </div>
  );
}
