import { useState } from 'react';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';

const ItemForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
	const [formData, setFormData] = useState({
		name: initialData?.name || '',
		description: initialData?.description || '',
		unit_price: initialData?.unit_price || '',
		quantity: initialData?.quantity || 1,
		category: initialData?.category || '',
	});

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		onSubmit({
			...formData,
			unit_price: Number(formData.unit_price),
			quantity: Number(formData.quantity),
		});
	};

	return (
		<Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 640 }}>
			<Typography variant="h6" gutterBottom>
				{initialData ? 'Edit item' : 'Add item'}
			</Typography>
			<TextField fullWidth required name="name" label="Item name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
			<TextField fullWidth name="description" label="Description" value={formData.description} onChange={handleChange} multiline minRows={2} sx={{ mb: 2 }} />
			<TextField fullWidth required name="unit_price" label="Unit price" type="number" inputProps={{ min: 0, step: 0.01 }} value={formData.unit_price} onChange={handleChange} sx={{ mb: 2 }} />
			<TextField fullWidth required name="quantity" label="Quantity" type="number" inputProps={{ min: 1, step: 1 }} value={formData.quantity} onChange={handleChange} sx={{ mb: 2 }} />
			<TextField fullWidth name="category" label="Category" value={formData.category} onChange={handleChange} sx={{ mb: 3 }} />
			<Box sx={{ display: 'flex', gap: 2 }}>
				<Button type="submit" variant="contained" disabled={isLoading}>
					{initialData ? 'Save changes' : 'Add item'}
				</Button>
				<Button type="button" onClick={onCancel} disabled={isLoading}>Cancel</Button>
			</Box>
		</Paper>
	);
};

export default ItemForm;
