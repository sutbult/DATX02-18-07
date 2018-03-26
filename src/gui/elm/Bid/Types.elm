<<<<<<< HEAD
module Bid.Types exposing (..)

type Status
    = Active
    | Pending
    | Finished

type alias Value =
    { currency : String
    , amount : Float
    }

type alias Bid =
    { id : String
    , status : Status
    , from : Value
    , to : Value
    }
=======
module Bid.Types exposing (..)

type Status
    = Active
    | Pending
    | Finished

type alias Value =
    { currency : String
    , amount : Float
    }

type alias Bid =
    { id : String
    , status : Status
    , from : Value
    , to : Value
    }


-- Easy constructor for Bid
createBid
    :  String
    -> Status
    -> String
    -> Float
    -> String
    -> Float
    -> Bid
createBid id status fromCurrency fromAmount toCurrency toAmount =
    Bid id status
        (Value fromCurrency fromAmount)
        (Value toCurrency toAmount)
>>>>>>> bd487d29d10b6dc84613dee454bc4d3eaf8d3b6e
