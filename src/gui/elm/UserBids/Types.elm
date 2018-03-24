module UserBids.Types exposing (..)

import Bid.Types exposing (Bid)

type alias Model =
    { bids : List Bid
    }

type Msg
    = Noop
    | SetBids (List Bid)
