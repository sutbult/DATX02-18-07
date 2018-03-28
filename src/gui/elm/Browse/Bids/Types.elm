module Browse.Bids.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import Error.Types

type alias Model =
    { bids : List Bid
    , modal : Maybe Bid
    , processing : Bool
    , sseID : Int
    }

type Msg
    = SetBids (List Bid)
    | DisplayModal Bid
    | CancelModal
    | AcceptBid Bid
    | EndProcessingBid
    | GetSSEId Int
    | Noop
    | AcceptFailure Error.Types.Msg
    | ToError Error.Types.Msg
