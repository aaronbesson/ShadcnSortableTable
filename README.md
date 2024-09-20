
# ShadCN Sortable Table

This component is a reusable sortable table built using ShadCN for React. It allows developers to display various types of data in a table format, with features such as sorting, mobile responsiveness, and customizable cell rendering. The component is versatile and can be adapted for many use cases, such as displaying lists of estimates, invoices, or any other tabular data.

## Features

- **Sortable Columns**: Easily sort columns by clicking on the headers.
- **Custom Cell Rendering**: Define how data should be displayed using the `render` method.
- **Responsive Design**: Hide specific columns on mobile devices using the `hideOnMobile` property.
- **TypeScript Support**: Fully typed with TypeScript to provide better autocompletion and type safety.
- **Linkable Data**: Pass link elements to any column for navigation (e.g., linking to estimate or invoice details).

## Example Usage

Here's how you can use the ShadCN Sortable Table component to display a list of estimates:

### Estimate List Example

```tsx
import Link from 'next/link';
import { formatFullDate, getStatusStyle } from 'path/to/utils'; // Your date formatting and status styling utilities

const columns = [
  {
    key: 'estimateNumber',
    header: 'Estimate #',
    render: (value: string, item: EstimateProps) => (
      <Link href={`/estimates/${item.estimateId}`} className="font-medium hover:underline">
        {value}
      </Link>
    ),
  },
  {
    key: 'clientName',
    header: 'Client Name',
    render: (value: string, item: EstimateProps) => (
      <Link href={`/estimates/${item.estimateId}`} className="hover:underline">
        {value}
      </Link>
    ),
  },
  {
    key: 'estimateDate',
    header: 'Date Created',
    render: (value: string) => formatFullDate(value),
    hideOnMobile: true,
  },
  {
    key: 'expirationDate',
    header: 'Due Date',
    render: (value: string) => formatFullDate(value),
    hideOnMobile: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: string) => (
      <span className={getStatusStyle(value)}>
        {value}
      </span>
    ),
  },
  {
    key: 'total',
    header: 'Amount',
    render: (value: number) => `$${value.toLocaleString()}`,
  }
];

// Then pass this `columns` array into the ShadCN Sortable Table component
```

### Invoice List Example

You can use the same table for invoices by adjusting the `columns` array to suit the structure of your invoice data:

```tsx
const invoiceColumns = [
  {
    key: 'invoiceNumber',
    header: 'Invoice #',
    render: (value: string, item: InvoiceProps) => (
      <Link href={`/invoices/${item.invoiceId}`} className="font-medium hover:underline">
        {value}
      </Link>
    ),
  },
  {
    key: 'clientName',
    header: 'Client Name',
    render: (value: string, item: InvoiceProps) => (
      <Link href={`/invoices/${item.invoiceId}`} className="hover:underline">
        {value}
      </Link>
    ),
  },
  {
    key: 'invoiceDate',
    header: 'Date Issued',
    render: (value: string) => formatFullDate(value),
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    render: (value: string) => formatFullDate(value),
  },
  {
    key: 'totalAmount',
    header: 'Amount',
    render: (value: number) => `$${value.toLocaleString()}`,
  }
];

// Use the `invoiceColumns` array for the ShadCN Sortable Table component.
```

### Task List Example

You can adapt the table for various use cases, such as displaying a list of tasks:

```tsx
const taskColumns = [
  {
    key: 'taskName',
    header: 'Task Name',
    render: (value: string, item: TaskProps) => (
      <Link href={`/tasks/${item.taskId}`} className="font-medium hover:underline">
        {value}
      </Link>
    ),
  },
  {
    key: 'assignee',
    header: 'Assignee',
    render: (value: string, item: TaskProps) => (
      <span>{value}</span>
    ),
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    render: (value: string) => formatFullDate(value),
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (value: string) => (
      <span className={`priority-${value.toLowerCase()}`}>
        {value}
      </span>
    ),
  }
];

// Use `taskColumns` for the ShadCN Sortable Table component.
```

## Column Configuration

Each column is defined with the following properties:

- `key`: The key corresponding to the data field.
- `header`: The text displayed in the column header.
- `render`: A function that takes the `value` of the field and the `item` (row data) and returns JSX to render in the cell.
- `hideOnMobile`: (Optional) Set to `true` to hide this column on mobile devices.

## Installation

To use this component in your project:

1. Install the required dependencies:
   ```bash
   npm install shadcn-table
   ```

2. Import the table component and provide the column configuration and data:
   ```tsx
   import { SortableTable } from 'shadcn-table';

   const data = [
     // Your data here
   ];

   <SortableTable columns={columns} data={data} />;
   ```

## Customization

You can customize the table by modifying the `columns` array and changing the `render` function to suit the specific data types you want to display.

For example:
- Add links to navigate to a different page.
- Format numbers, dates, or status labels.
- Hide columns on mobile using `hideOnMobile`.

