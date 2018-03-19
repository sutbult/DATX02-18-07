module Browse.Bids.Types exposing (..)

type alias Value =
    { currency : String
    , amount : Float
    }

type alias Bid =
    { id : String
    , from : Value
    , to : Value
    }

type alias Model =
    { bids : List Bid
    }

type Msg =
    SetBids (List Bid)
