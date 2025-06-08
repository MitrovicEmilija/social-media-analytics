/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Categories = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const db = getFirestore();

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "categories"));
      const categoryList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (user) fetchCategories();
  }, [user]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const categoryRef = doc(collection(db, "users", user.uid, "categories"));
      await setDoc(categoryRef, { name: newCategory.trim() });
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "categories", id));
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Categories
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          label="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddCategory} disabled={!newCategory.trim()}>
          Add Category
        </Button>
      </Box>
      <List>
        {categories.map((category) => (
          <ListItem key={category.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleDeleteCategory(category.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Categories;