import { Box, Typography } from '@mui/material';
import StudentFundList from '../studentFunds/StudentFundList';

const Students = () => (
    <Box sx={{ pb: 4 }}>
        <Typography variant="h4" gutterBottom>
            Students
        </Typography>
        <StudentFundList />
    </Box>
);

export default Students;