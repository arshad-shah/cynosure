import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../../feedback/Badge/Badge.js';
import { Button } from '../../forms/Button/Button.js';
import { SearchInput } from '../../forms/SearchInput/SearchInput.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import type { ColumnDef } from './DataTable.js';
import { DataTable } from './DataTable.js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
  joined: string;
}

const USERS: User[] = [
  {
    id: '1',
    name: 'Ava Thompson',
    email: 'ava@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2026-04-16',
    joined: '2023-01-12',
  },
  {
    id: '2',
    name: 'Marcus Lin',
    email: 'marcus@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-15',
    joined: '2023-04-02',
  },
  {
    id: '3',
    name: 'Sara Park',
    email: 'sara@example.com',
    role: 'member',
    status: 'invited',
    lastActive: '2026-04-10',
    joined: '2024-11-20',
  },
  {
    id: '4',
    name: 'Dylan Moore',
    email: 'dylan@example.com',
    role: 'guest',
    status: 'suspended',
    lastActive: '2026-03-14',
    joined: '2022-06-03',
  },
  {
    id: '5',
    name: 'Nia Adebayo',
    email: 'nia@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2026-04-17',
    joined: '2021-08-17',
  },
  {
    id: '6',
    name: 'Finn O’Brien',
    email: 'finn@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-11',
    joined: '2023-07-09',
  },
  {
    id: '7',
    name: 'Priya Narayan',
    email: 'priya@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-12',
    joined: '2024-02-18',
  },
  {
    id: '8',
    name: 'Kenji Tanaka',
    email: 'kenji@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-09',
    joined: '2024-06-01',
  },
  {
    id: '9',
    name: 'Clara Vance',
    email: 'clara@example.com',
    role: 'guest',
    status: 'active',
    lastActive: '2026-04-08',
    joined: '2025-01-05',
  },
  {
    id: '10',
    name: 'Oscar Ruiz',
    email: 'oscar@example.com',
    role: 'member',
    status: 'invited',
    lastActive: '2026-04-07',
    joined: '2024-09-23',
  },
  {
    id: '11',
    name: 'Leila Haddad',
    email: 'leila@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-16',
    joined: '2024-12-01',
  },
  {
    id: '12',
    name: 'Noa Weiss',
    email: 'noa@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2026-04-15',
    joined: '2022-03-14',
  },
  {
    id: '13',
    name: 'Aiden Kelly',
    email: 'aiden@example.com',
    role: 'guest',
    status: 'active',
    lastActive: '2026-04-06',
    joined: '2025-02-10',
  },
  {
    id: '14',
    name: 'Yusuf Öztürk',
    email: 'yusuf@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-11',
    joined: '2023-10-30',
  },
  {
    id: '15',
    name: 'Elena Costa',
    email: 'elena@example.com',
    role: 'member',
    status: 'active',
    lastActive: '2026-04-14',
    joined: '2024-05-12',
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Data display/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof DataTable>;

const statusScheme = (status: User['status']): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'active') return 'success';
  if (status === 'invited') return 'warning';
  if (status === 'suspended') return 'danger';
  return 'neutral';
};

const baseColumns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge colorScheme={statusScheme(row.original.status)} size="sm">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'lastActive', header: 'Last active' },
];

export const Basic: Story = {
  render: () => <DataTable<User> data={USERS.slice(0, 8)} columns={baseColumns} />,
};

export const Sortable: Story = {
  render: () => <DataTable<User> data={USERS} columns={baseColumns} sortable />,
};

export const WithPagination: Story = {
  name: 'Pagination',
  render: () => (
    <DataTable<User> data={USERS} columns={baseColumns} sortable pagination={{ pageSize: 5 }} />
  ),
};

export const WithSelection: Story = {
  name: 'Selection + bulk action bar',
  render: () => {
    function SelectionDemo(): React.ReactElement {
      const [selected, setSelected] = useState<User[]>([]);
      return (
        <Stack gap="3">
          {selected.length > 0 ? (
            <Inline
              gap="3"
              align="center"
              justify="between"
              style={{
                padding: 'var(--cynosure-space-3)',
                background: 'var(--cynosure-color-accent-muted)',
                borderRadius: 'var(--cynosure-radius-md)',
              }}
            >
              <Text weight="medium">{selected.length} selected</Text>
              <Inline gap="2">
                <Button size="sm" variant="soft">
                  Export
                </Button>
                <Button size="sm" variant="soft" colorScheme="danger">
                  Delete
                </Button>
              </Inline>
            </Inline>
          ) : null}
          <DataTable<User>
            data={USERS.slice(0, 8)}
            columns={baseColumns}
            selectable
            onSelectionChange={setSelected}
            pagination={{ pageSize: 8 }}
          />
        </Stack>
      );
    }
    return <SelectionDemo />;
  },
};

export const WithSearch: Story = {
  name: 'Filter (search)',
  render: () => {
    function SearchDemo(): React.ReactElement {
      const [query, setQuery] = useState('');
      return (
        <DataTable<User>
          data={USERS}
          columns={baseColumns}
          sortable
          pagination={{ pageSize: 5 }}
          filter={{ global: query, onGlobalFilterChange: setQuery }}
          toolbar={
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search users…"
              style={{ maxWidth: 320 }}
            />
          }
        />
      );
    }
    return <SearchDemo />;
  },
};

export const LoadingState: Story = {
  name: 'Loading skeleton',
  render: () => (
    <DataTable<User>
      data={[]}
      columns={baseColumns}
      loading
      loadingRows={6}
      pagination={{ pageSize: 10 }}
    />
  ),
};

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => (
    <DataTable<User>
      data={[]}
      columns={baseColumns}
      emptyState={
        <Stack gap="1" align="center">
          <Text weight="semibold">No users match your filters</Text>
          <Text size="sm" color="fg.muted">
            Try clearing the search or invite someone new.
          </Text>
        </Stack>
      }
    />
  ),
};

export const Interaction: Story = {
  name: 'Interaction · sort a column and select a row',
  render: () => {
    function Demo(): React.ReactElement {
      const [selected, setSelected] = useState<User[]>([]);
      return (
        <Stack gap="3">
          <Text size="sm" color="fg.muted">
            Selected: <strong>{selected.length}</strong>
          </Text>
          <DataTable<User>
            data={USERS.slice(0, 4)}
            columns={baseColumns}
            sortable
            selectable
            onSelectionChange={setSelected}
          />
        </Stack>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameHeader = canvas.getByRole('button', { name: /Name/ });
    const headerCell = nameHeader.closest('th');
    await expect(headerCell).toHaveAttribute('aria-sort', 'none');

    const firstDataCell = () => canvas.getAllByRole('row')[1];

    // First click sorts ascending (Ava … already first), second click descending.
    await userEvent.click(nameHeader);
    await expect(headerCell).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(nameHeader);
    await expect(headerCell).toHaveAttribute('aria-sort', 'descending');
    await waitFor(() => {
      // Descending by name puts "Sara Park" at the top of the body.
      expect(within(firstDataCell()).getByText('Sara Park')).toBeInTheDocument();
    });

    // Selecting a row checkbox marks it checked and reports the selection up.
    const rowCheckbox = canvas.getAllByRole('checkbox', { name: 'Select row' })[0];
    await userEvent.click(rowCheckbox);
    await expect(rowCheckbox).toBeChecked();
    await expect(canvas.getByText('Selected:').parentElement).toHaveTextContent('Selected: 1');
  },
};
