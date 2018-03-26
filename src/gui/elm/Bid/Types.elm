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
