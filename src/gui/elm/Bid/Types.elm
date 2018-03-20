module Bid.Types exposing (..)

type alias Value =
    { currency : String
    , amount : Float
    }

type alias Bid =
    { id : String
    , from : Value
    , to : Value
    }
