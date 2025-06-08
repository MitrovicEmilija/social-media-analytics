/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";

const Dashboard = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ amount: "", category: "", description: "", date: "" });
  const [editTransaction, setEditTransaction] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const baseUrl = "http://localhost:5001/social-media-analytics-b1bd7/us-central1";

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${baseUrl}/listTransactions?limit=50`, {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch transactions");
      }
      const result = await response.json();
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User is signed in:", user.uid);
      fetchTransactions();
    }
  }, [user]);

  const handleAddTransaction = async () => {
    try {
      if (!Number.isFinite(parseFloat(newTransaction.amount))) {
        alert("Please enter a valid amount.");
        return;
      }
      if (!newTransaction.category.trim()) {
        alert("Please enter a category.");
        return;
      }
      if (!newTransaction.description.trim()) {
        alert("Please enter a description.");
        return;
      }
      if (!newTransaction.date) {
        alert("Please select a date.");
        return;
      }

      console.log("Sending transaction:", newTransaction);
      const response = await fetch(`${baseUrl}/addTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category.trim(),
          description: newTransaction.description.trim(),
          date: newTransaction.date,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add transaction");
      }
      const result = await response.json();
      console.log("Transaction added:", result);
      setNewTransaction({ amount: "", category: "", description: "", date: "" });
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editTransaction) return;
    try {
      if (!Number.isFinite(parseFloat(editTransaction.amount))) {
        alert("Please enter a valid amount.");
        return;
      }
      if (!editTransaction.category.trim()) {
        alert("Please enter a category.");
        return;
      }
      if (!editTransaction.description.trim()) {
        alert("Please enter a description.");
        return;
      }
      if (!editTransaction.date) {
        alert("Please select a date.");
        return;
      }

      console.log("Sending update transaction:", editTransaction);
      const response = await fetch(`${baseUrl}/updateTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          transactionId: editTransaction.id,
          amount: parseFloat(editTransaction.amount),
          category: editTransaction.category.trim(),
          description: editTransaction.description.trim(),
          date: editTransaction.date,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update transaction");
      }
      setEditTransaction(null);
      setOpenDialog(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      console.log("Deleting transaction:", id);
      const response = await fetch(`${baseUrl}/deleteTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ transactionId: id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete transaction");
      }
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const openEditDialog = (transaction) => {
    setEditTransaction({
      ...transaction,
      date: transaction.date.split("T")[0],
    });
    setOpenDialog(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box component="form" sx={{ mb: 4 }}>
        <TextField
          label="Amount"
          type="number"
          value={newTransaction.amount}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || !isNaN(parseFloat(value))) {
              setNewTransaction({ ...newTransaction, amount: value });
            }
          }}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Category"
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Description"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Date"
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2, mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAddTransaction}
          disabled={!newTransaction.amount || !newTransaction.category || !newTransaction.description || !newTransaction.date}
        >
          Add Transaction
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount ($)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), "MM/dd/yyyy")}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => openEditDialog(transaction)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTransaction(transaction.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={editTransaction?.amount || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || !isNaN(parseFloat(value))) {
                setEditTransaction({ ...editTransaction, amount: value });
              }
            }}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            label="Category"
            fullWidth
            value={editTransaction?.category || ""}
            onChange={(e) => setEditTransaction({ ...editTransaction, category: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            value={editTransaction?.description || ""}
            onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={editTransaction?.date || ""}
            onChange={(e) => setEditTransaction({ ...editTransaction, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateTransaction} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;