import * as React from "react";
import { Card, Typography, Button, Grid, TextField, Snackbar, Alert } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { StyledDivider } from "./SubTotalStyled";
import { useDispatch, useSelector } from "react-redux";
import { DateContext } from "../../Context/DateContex";
import {
  countAdult,
  countChild,
  countNights,
  countRooms,
  calculateTotal,
} from "../../redux/slices/bookingSlice";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import axios from 'axios'

export default function SubTotal() {
  const dispatch = useDispatch();
  const { startDate, endDate, setDateRange } = React.useContext(DateContext);
  const { child, adult, numberooms, nights } = useSelector((state) => state.booking);
  const { price, room_number } = useSelector((state) => state.types.types);
  const [hostData, setHostData] = React.useState({ hosts: [] })
  const [unavailableDates, setUnavailableDates] = React.useState(new Set());
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
console.log(room_number)
  const secondDateMin = startDate ? startDate.add(1, "day") : null;
  const isSecondPickerDisabled = !startDate;
  const childNumber = +child;
  const adultNumber = +adult;
  const today = dayjs();

  const reservationData = hostData.hosts.flatMap((host) => host.reservations);

const  convertDataHostIn = dayjs(reservationData.room_check_in).format('YYYY-MM-DD')
const  convertDataHostOut = dayjs(reservationData.room_check_out).format('YYYY-MM-DD')
console.log(convertDataHostOut)
console.log(convertDataHostIn)

  const checkAvailability = () => {
    if (!startDate || !endDate) {
      console.log("Start date or end date is not selected");
      return;
    }
    const reservations = reservationData.filter((reservation) => {
      const checkInDate = dayjs(reservation.room_check_in)?.startOf('day');
      const checkOutDate = dayjs(reservation.room_check_out)?.startOf('day');
      const selectedStartDate = startDate.startOf('day');
      const selectedEndDate = endDate.startOf('day');
      
      return (
        checkInDate?.isSame(selectedStartDate) &&
        checkOutDate?.isSame(selectedEndDate)
      );
    });
        console.log(reservations)

    if (reservations.length > 0) {
      const dates = reservations.map((reservation) => reservation.room_check_in);
      setUnavailableDates(new Set(dates));
      setIsSnackbarOpen(true);
    } else {
      setUnavailableDates(new Set());
      setIsSnackbarOpen(false);
    }
  };

  React.useEffect(() => {
    checkAvailability();
  }, [startDate, endDate]);

  const fetchHostData = async () => {
    try {
      const response = await axios(`/hosts`);
      const hostsData = response.data;
      setHostData(hostsData);
    } catch (error) {
      console.error("Error al obtener los datos:", error)
    }
  }


  const subTotal = price * nights * numberooms * (childNumber + adultNumber);
  const handleStartDateChange = (date) => {
    setDateRange(date, endDate);
  };

  const handleEndDateChange = (date) => {
    setDateRange(startDate, date);
  };
  const handleAdultChange = (event) => {
    const { value } = event.target;
    if (value === "" || (Number(value) > 0 && !value.includes("-"))) {
      dispatch(countAdult(value));
    }
  };

  const handleChildChange = (event) => {
    const { value } = event.target;
    if (value === "" || (Number(value) >= 0 && !value.includes("-"))) {
      dispatch(countChild(value));
    }
  };

  // const handleRoomsChange = (event) => {
  //   const { value } = event.target;
  //   if (value === "" || (Number(value) > 0 && !value.includes("-"))) {
  //     dispatch(countRooms(value));
  //   }
  // };

  const handleTotaLClik = () => {
    dispatch(calculateTotal(subTotal));
  };

  React.useEffect(() => {
    fetchHostData()
  }, []);

  React.useEffect(() => {
    if (startDate && endDate) {
      const count = countSelectedDays();
      dispatch(countNights(count));
    }
  }, [startDate, endDate, dispatch]);

  const countSelectedDays = () => {
    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const diff = end.diff(start, "day");
      return diff;
    }
    return 0;
  };

  return (
    <div>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setIsSnackbarOpen(false)}
      >
        <Alert severity="warning">
          Selected dates are not available.
        </Alert>
      </Snackbar>
      <Card
        elevation={0}
        sx={{
          backgroundColor: "#9A98FE",
          alignContent: "center",
          padding: "15px",
          margin: "20px",
          marginBottom: "-22px",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#FAFAFF",
            textAlign: "center",
          }}
        >
          {" "}
          Choose your Date
        </Typography>
      </Card>
      <Card
        elevation={0}
        sx={{
          backgroundColor: "#F3F3F7",
          height: "auto",
          padding: "15px",
          margin: "20px",
        }}
      >
        <Grid container justifyContent="center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={["DatePicker"]}
              sx={{ marginTop: "20px" }}
            >
              <DatePicker
                label="Check In"
                value={startDate}
                minDate={today}
                shouldDisableDate={(date) => unavailableDates.has(date.format("YYYY-MM-DD"))}
                onChange={handleStartDateChange}
              />
            </DemoContainer>
            <DemoContainer components={["DatePicker"]} sx={{}}>
              <DatePicker
                label="Check Out"
                value={endDate}
                minDate={secondDateMin}
                shouldDisableDate={(date) => unavailableDates.has(date.format("YYYY-MM-DD"))}
                onChange={handleEndDateChange}
                disabled={isSecondPickerDisabled}
              />
            </DemoContainer>

            <Grid container
              justifyContent="center"
              spacing={2}
              marginTop={2}
              marginBottom={3}
            >
              <Grid item xs={3} sm={4}>
                <TextField
                  id="subAdult"
                  label="Adult"
                  type="number"
                  value={adult}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="standard"
                  onChange={handleAdultChange}
                />
              </Grid>
              <Grid item xs={3} sm={4}>
                <TextField
                  id="subChild"
                  label="Child"
                  type="number"
                  value={child}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="standard"
                  onChange={handleChildChange}
                />
              </Grid>
              {/* <Grid item xs={3} sm={3}>
                <TextField
                  id="subRooms"
                  label="Rooms"
                  type="number"
                  value={numberooms}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="standard"
                  onChange={handleRoomsChange}
                />
              </Grid> */}
            </Grid>
          </LocalizationProvider>
        </Grid>
        <StyledDivider />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="h1"
              sx={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#868688",
                marginTop: "30px",
                marginLeft: '45PX'
              }}
            >
              SubTotal
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#C2C2C2",
                marginTop: "10px",
                marginLeft: "50px",
                display: 'flex'
              }}
            >
              {numberooms} Rooms
              <br />
              {nights} Nights
              <br />
              {adult} Adult
              <br />
              {child} Child
              <br />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="h1"
              sx={{
                fontSize: "35px",
                fontWeight: "bold",
                color: "#0400CB",
                marginTop: "20px",
                marginLeft: '30px'
              }}
            >
              ${subTotal}
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#9A98FE",
                marginLeft: "80px",
              }}
            >
              USD
            </Typography>
          </Grid>
          <Grid container justifyContent="center" style={{ marginTop: "20px" }}>
            <Link to="/pay">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{
                  marginTop: "30px",
                  marginBottom: "10px",
                  borderRadius: "20px",
                  fontSize: "17px",
                  width: "150px",
                }}
                sx={{
                  backgroundColor: "#9A98FE",
                  "&:hover": {
                    backgroundColor: "#c2c1fe",
                  },
                }}
                onClick={handleTotaLClik}
              >
                Reserve
              </Button>
            </Link>
            <Typography
              variant="h1"
              sx={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "#9A98FE",
                margin: "20px",
              }}
            >
              Please read and understand our cancellation policy prior to
              booking.
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
}
