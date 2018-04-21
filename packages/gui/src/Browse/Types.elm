module Browse.Types exposing (..)

import BidList.Types as BidListTypes
import Browse.Accept.Types as AcceptTypes


type alias Model =
    { bidList : BidListTypes.Model
    , accept : AcceptTypes.Model
    }


type Msg
    = ToBidList BidListTypes.Msg
    | ToAccept AcceptTypes.Msg
    | TriggerPassword (List String) (Maybe Msg) Msg


mapBidListCmd : BidListTypes.Msg -> Msg
mapBidListCmd msg =
    case msg of
        BidListTypes.BidClick bid ->
            ToAccept <| AcceptTypes.DisplayModal bid

        subMsg ->
            ToBidList subMsg


mapAcceptCmd : AcceptTypes.Msg -> Msg
mapAcceptCmd msg =
    case msg of
        AcceptTypes.ToError error ->
            ToBidList <| BidListTypes.ToError error

        AcceptTypes.TriggerPassword promptedPasswords onCancel onSuccess ->
            TriggerPassword
                promptedPasswords
                (Maybe.map mapAcceptCmd onCancel)
                (mapAcceptCmd onSuccess)

        subMsg ->
            ToAccept subMsg
