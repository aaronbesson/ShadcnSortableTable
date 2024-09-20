"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { formatCurrency } from "../CurrencyFormatter"

interface Column<T> {
    key: keyof T | string;  // Allow string keys as well
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
    hideOnMobile?: boolean; // New property
}

interface SortableTableProps<T> {
    data: T[];
    columns: Column<T>[];
    defaultSortField: keyof T;
    defaultSortDirection?: "asc" | "desc";
    filterField?: keyof T;
    filterPlaceholder?: string;
    itemsPerPageOptions?: number[];
    defaultItemsPerPage?: number;
    showTotalAmount?: boolean;
    totalAmountField?: keyof T;
    exportFileName?: string;
    title?: string; // New prop for the table title
    allowRowSelection?: boolean;
    onRowSelection?: (selectedRows: Set<number>) => void;
    onDeleteSelected?: (selectedItems: T[]) => Promise<void>;
}

export default function SortableTable<T>({
    data,
    columns,
    defaultSortField,
    defaultSortDirection = "desc",
    filterField,
    filterPlaceholder = "Search...",
    itemsPerPageOptions = [10, 25, 50],
    defaultItemsPerPage = 10,
    showTotalAmount = false,
    totalAmountField,
    exportFileName = "export",
    title, // New prop
    allowRowSelection = false,
    onRowSelection,
    onDeleteSelected,
}: SortableTableProps<T>) {
    const [sortField, setSortField] = useState<keyof T>(columns[0].key as keyof T)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)
    const [filter, setFilter] = useState("")
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const filteredAndSortedData = useMemo(() => {
        let filtered = [...data]
        // Filter the data based on the filter field and value
        if (filterField && filter) {
            filtered = filtered.filter(item =>
                String(item[filterField]).toLowerCase().includes(filter.toLowerCase())
            )
        }
        // Sort the data based on the sort field and direction
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            if (aValue === undefined || bValue === undefined) {
                return 0
            }
            // If the values are numbers, sort them
            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue
            }
            // If the values are dates, sort them
            if (aValue instanceof Date && bValue instanceof Date) {
                return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
            }
            // If the values are strings, sort them
            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
            }
            // If types don't match or are not comparable, return 0
            return 0
        })
        return filtered
    }, [data, filterField, filter, sortField, sortDirection])

    // Paginate the data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredAndSortedData, currentPage, itemsPerPage])

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

    // Function to handle sorting
    const handleSort = (field: keyof T) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    // Function to render the sort icon
    const SortIcon = ({ field }: { field: keyof T }) => {
        if (field !== sortField) return null
        return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
    }

    // Function to get a plain value for CSV export
    const getPlainValue = (item: T, key: keyof T | string): string => {
        const value = item[key as keyof T];
        if (value === null || value === undefined) {
            return '';
        }
        if (value instanceof Date) {
            return format(value, 'yyyy-MM-dd');
        }
        return String(value).replace(/"/g, '""');
    };

    const handleExportSelected = () => {
        const selectedData = paginatedData.filter((_, index) => selectedRows.has(index));
        const headers = columns.map(column => column.header);
        const csvData = [
            headers.join(','),
            ...selectedData.map(item =>
                columns.map(column => getPlainValue(item, column.key)).join(',')
            )
        ].join('\n');

        downloadCSV(csvData, `${exportFileName}-selected-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    };

    // Function to handle exporting all data
    const handleExportAll = () => {
        const headers = columns.map(column => column.header);
        const csvData = [
            headers.join(','),
            ...filteredAndSortedData.map(item =>
                columns.map(column => getPlainValue(item, column.key)).join(',')
            )
        ].join('\n');

        downloadCSV(csvData, `${exportFileName}-all-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    };

    // Function to handle deleting selected items
    const handleDeleteSelected = async () => {
        if (onDeleteSelected) {
            const selectedData = paginatedData.filter((_, index) => selectedRows.has(index));
            await onDeleteSelected(selectedData);
            setSelectedRows(new Set());
        }
        setIsDeleteDialogOpen(false);
    };

    const handleActionSelect = (value: string) => {
        switch (value) {
            case "exportSelected":
                handleExportSelected();
                break;
            case "exportAll":
                handleExportAll();
                break;
            case "delete":
                setIsDeleteDialogOpen(true);
                break;
        }
    };

    // Function to download CSV
    const downloadCSV = (csvData: string, fileName: string) => {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    // Function to handle row selection
    const handleRowSelection = (rowIndex: number) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) {
                newSet.delete(rowIndex);
            } else {
                newSet.add(rowIndex);
            }
            if (onRowSelection) {
                onRowSelection(newSet);
            }
            return newSet;
        });
    };

    // Function to handle selecting all rows
    const handleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedData.map((_, index) => index)));
        }
    };

    return (
        <Card className="">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        {title && <CardTitle>{title}</CardTitle>}
                    </div>

                    <div className="flex items-center space-x-2">
                        {filterField && (
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={filterPlaceholder}
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-44 text-sm"
                                />

                            </div>
                        )}
                        <Select onValueChange={handleActionSelect}>
                            <SelectTrigger className="w-24">
                                <SelectValue placeholder="Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="exportSelected">Export Selected</SelectItem>
                                <SelectItem value="exportAll">Export All</SelectItem>
                                <Separator className="my-2" />
                                <SelectItem value="delete">Delete Selected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-neutral-100 rounded-xl">
                        <TableRow>
                            {allowRowSelection && (
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedRows.size === paginatedData.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                            )}
                            {columns.map((column, index) => (
                                <TableHead
                                    key={column.key as string}
                                    onClick={() => handleSort(column.key as keyof T)}
                                    className={`${index === columns.length - 1 ? "text-right" : ""} cursor-pointer hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}>
                                    <div className={`flex items-center ${index === columns.length - 1 ? "justify-end" : ""}`}>
                                        {column.header} <SortIcon field={column.key as keyof T} />
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                        {paginatedData.length > 0 ? paginatedData.map((item, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {allowRowSelection && (
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.has(rowIndex)}
                                            onCheckedChange={() => handleRowSelection(rowIndex)}
                                        />
                                    </TableCell>
                                )}
                                {columns.map((column, colIndex) => (
                                    <TableCell
                                        key={column.key as string}
                                        className={`${colIndex === columns.length - 1 ? "text-right" : ""} ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}>
                                        {column.render
                                            ? column.render(item[column.key as keyof T], item)
                                            : item[column.key as keyof T] as React.ReactNode}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={allowRowSelection ? columns.length + 1 : columns.length} className="text-center">No data available</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-2">
                        <span>Show</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                                setItemsPerPage(Number(value))
                                setCurrentPage(1)
                            }}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                {itemsPerPageOptions.map((option) => (
                                    <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span>{currentPage} of {totalPages}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    {showTotalAmount && totalAmountField && (
                        <p className="text-md font-bold text-muted-foreground text-right items-end justify-end">
                            Total: {formatCurrency(filteredAndSortedData.reduce((sum, item) => sum + (Number(item[totalAmountField]) || 0), 0))}
                        </p>
                    )}
                </div>
            </CardContent>

            {/* Delete dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected items.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}