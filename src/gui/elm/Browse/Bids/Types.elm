module Browse.Bids.Types exposing (..)

import Bid.Types exposing (Bid)

type alias Model =
    { bids : List Bid
    , modal : Maybe Bid
    }

type Msg
    = SetBids (List Bid)
    | DisplayModal Bid
    | CancelModal
