Express Server --> PostgreSQL

# Operations
- Make Reservation
    - One week max ( 7 days )
    - No overlap
    - If overlap, return current renter/duration
- Cancel Reservation
- Show All Reservations
- Add Item
- List Items
- Update Item
- Remove Item
# Datasets
- Item
    - ID: Int
    - Name: String
    - IsReserved: Boolean
    - Holder: Reservation.ID: Int
- Reservation
    - ID: Int
    - Item Name: String
    - Reservee: Email
    - Start Date: Date
    - End Date: Date
    - Returned: Boolean
# Control
if (item.isReserved)
    return "Cannot reserve, Reservee has Item until End Date";
else
    item.isReserved = true;
    sendEmail("Order details", email)
    return "Success"

if(Today === End Date)
    sendEmail("Please return Item by the end of the day", email)

if(Today === End Date + 1 && Reservation.Returned === True)
    item.isReserved = false;
    item.Holder = 0;
else if (Today === End Date + 1 && Reservation.Returned === False)
    sendEmail("Please return your kitchenware.", email)

email intergration -> dockerization -> CI/CD -> deployment